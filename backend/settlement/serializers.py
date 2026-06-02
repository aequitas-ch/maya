from rest_framework import serializers
from .models import Institution, Insurance, CostApproval, CostApprovalStatus, CostApprovalLog
from core.models import Dependent

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name']

class InsuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insurance
        fields = ['id', 'name']

class CostApprovalStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostApprovalStatus
        fields = ['id', 'status', 'date']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['status_display'] = instance.get_status_display()
        return representation

class CostApprovalLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostApprovalLog
        fields = ['id', 'date', 'text']

class CostApprovalSerializer(serializers.ModelSerializer):
    ordering_institution = InstitutionSerializer(read_only=True)
    ordering_institution_id = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(), source='ordering_institution', write_only=True
    )
    executing_institution = InstitutionSerializer(read_only=True)
    executing_institution_id = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(), source='executing_institution', write_only=True
    )
    insurance = InsuranceSerializer(read_only=True)
    insurance_id = serializers.PrimaryKeyRelatedField(
        queryset=Insurance.objects.all(), source='insurance', write_only=True
    )
    dependent_id = serializers.PrimaryKeyRelatedField(
        queryset=Dependent.objects.all(), source='dependent', write_only=True
    )

    statuses = CostApprovalStatusSerializer(many=True, read_only=True)
    logs = CostApprovalLogSerializer(many=True, read_only=True)
    open_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CostApproval
        fields = [
            'id', 'dependent_id',
            'ordering_institution', 'ordering_institution_id',
            'executing_institution', 'executing_institution_id',
            'insurance', 'insurance_id',
            'next_reminder', 'approved_amount', 'settled_amount', 'open_amount',
            'statuses', 'logs'
        ]
