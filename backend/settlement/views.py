from rest_framework import viewsets, permissions, status, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from .models import Institution, Insurance, CostApproval, CostApprovalStatus, CostApprovalLog, SettlementCost
from documents.models import EncryptedDocument
from .serializers import (
    InstitutionSerializer, InsuranceSerializer, CostApprovalSerializer,
    CostApprovalStatusSerializer, CostApprovalLogSerializer, SettlementCostSerializer
)

class InstitutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Institution.objects.all().order_by('name')
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated]

class InsuranceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Insurance.objects.all().order_by('name')
    serializer_class = InsuranceSerializer
    permission_classes = [permissions.IsAuthenticated]

class CostApprovalViewSet(viewsets.ModelViewSet):
    serializer_class = CostApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see cost approvals for their dependents
        return CostApproval.objects.filter(
            dependent__users=self.request.user
        ).order_by('next_reminder')

    def perform_create(self, serializer):
        # Validate that the requested dependent_id belongs to the current user
        dependent = serializer.validated_data.get('dependent')
        if not self.request.user.dependents.filter(id=dependent.id).exists():
            raise exceptions.PermissionDenied("You do not have permission to add cost approvals for this dependent.")

        document_id = serializer.validated_data.get('document_id')
        if document_id:
            if not EncryptedDocument.objects.filter(id=document_id, user=self.request.user).exists():
                raise exceptions.PermissionDenied("You do not have permission to link this document.")

        serializer.save()

    def perform_update(self, serializer):
        document_id = serializer.validated_data.get('document_id', serializer.instance.document_id)
        if document_id and document_id != serializer.instance.document_id:
             if not EncryptedDocument.objects.filter(id=document_id, user=self.request.user).exists():
                raise exceptions.PermissionDenied("You do not have permission to link this document.")
        serializer.save()

    @action(detail=True, methods=['post'])
    def add_status(self, request, pk=None):
        cost_approval = self.get_object()
        serializer = CostApprovalStatusSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(cost_approval=cost_approval)
            # Re-fetch and return the whole cost approval
            return Response(self.get_serializer(cost_approval).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_log(self, request, pk=None):
        cost_approval = self.get_object()
        serializer = CostApprovalLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(cost_approval=cost_approval)
            # Re-fetch and return the whole cost approval
            return Response(self.get_serializer(cost_approval).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def upcoming_reminders(self, request):
        today = timezone.now().date()
        reminders_query = CostApproval.objects.filter(
            dependent__users=request.user
        ).filter(
            Q(next_reminder__lte=today + timedelta(days=14)) |
            Q(valid_to__lte=today + timedelta(days=30))
        )

        # We can't directly order by a conditional logic in simple ORM without annotation.
        # But we can fetch, serialize and sort in Python or sort by valid_to/next_reminder
        # Let's just sort by valid_to ascending (most urgent first).

        # A simple order_by to roughly handle urgency.
        # Alternatively, we just return the serialized data.
        reminders_query = reminders_query.order_by('valid_to', 'next_reminder')

        serializer = self.get_serializer(reminders_query, many=True)
        return Response(serializer.data)

class SettlementCostViewSet(viewsets.ModelViewSet):
    serializer_class = SettlementCostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = SettlementCost.objects.filter(
            cost_approval__dependent__users=self.request.user
        )

        cost_approval_id = self.request.query_params.get('cost_approval_id')
        if cost_approval_id:
            queryset = queryset.filter(cost_approval_id=cost_approval_id)

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        paid_by_parents = self.request.query_params.get('paid_by_parents')
        if paid_by_parents is not None:
            paid_bool = paid_by_parents.lower() in ['true', '1', 't', 'y', 'yes']
            queryset = queryset.filter(paid_by_parents=paid_bool)

        return queryset.order_by('-invoice_date')

    def perform_create(self, serializer):
        cost_approval = serializer.validated_data.get('cost_approval')
        if not self.request.user.dependents.filter(id=cost_approval.dependent_id).exists():
            raise exceptions.PermissionDenied("You do not have permission to add costs to this approval.")

        document_id = serializer.validated_data.get('document_id')
        if document_id:
            if not EncryptedDocument.objects.filter(id=document_id, user=self.request.user).exists():
                raise exceptions.PermissionDenied("You do not have permission to link this document.")

        serializer.save()

    def perform_update(self, serializer):
        document_id = serializer.validated_data.get('document_id', serializer.instance.document_id)
        if document_id and document_id != serializer.instance.document_id:
             if not EncryptedDocument.objects.filter(id=document_id, user=self.request.user).exists():
                raise exceptions.PermissionDenied("You do not have permission to link this document.")
        serializer.save()
