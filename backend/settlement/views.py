from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Institution, Insurance, CostApproval, CostApprovalStatus, CostApprovalLog
from .serializers import (
    InstitutionSerializer, InsuranceSerializer, CostApprovalSerializer,
    CostApprovalStatusSerializer, CostApprovalLogSerializer
)

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all().order_by('name')
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated]

class InsuranceViewSet(viewsets.ModelViewSet):
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
