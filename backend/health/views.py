from rest_framework import viewsets, permissions
from .models import HealthMetric, HealthRecord
from .serializers import HealthMetricSerializer, HealthRecordSerializer

class HealthMetricViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HealthMetric.objects.all()
    serializer_class = HealthMetricSerializer
    permission_classes = [permissions.IsAuthenticated]

class HealthRecordViewSet(viewsets.ModelViewSet):
    serializer_class = HealthRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return records for dependents associated with the current user
        user = self.request.user
        dependent_id = self.request.query_params.get('dependent_id')

        queryset = HealthRecord.objects.filter(dependent__users=user)

        if dependent_id:
            queryset = queryset.filter(dependent_id=dependent_id)

        return queryset

    def perform_create(self, serializer):
        # Validate that the requested dependent_id belongs to the current user
        dependent = serializer.validated_data.get('dependent')
        if not self.request.user.dependents.filter(id=dependent.id).exists():
            raise permissions.PermissionDenied("You do not have permission to add health records for this dependent.")

        serializer.save()
