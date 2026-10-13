from rest_framework import serializers
from .models import Institution, Insurance, CostApproval, CostApprovalStatus, CostApprovalLog, SettlementCost
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

class SettlementCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = SettlementCost
        fields = [
            'id', 'cost_approval', 'invoice_number', 'invoice_date', 'amount',
            'paid_by_parents', 'reimbursed_amount', 'status', 'document_id', 'comment'
        ]

class CostApprovalSerializer(serializers.ModelSerializer):
    ordering_institution = InstitutionSerializer(read_only=True)
    ordering_institution_id = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(), source='ordering_institution', write_only=True, required=False, allow_null=True
    )
    executing_institution = InstitutionSerializer(read_only=True)
    executing_institution_id = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(), source='executing_institution', write_only=True, required=False, allow_null=True
    )
    insurance = InsuranceSerializer(read_only=True)
    insurance_id = serializers.PrimaryKeyRelatedField(
        queryset=Insurance.objects.all(), source='insurance', write_only=True, required=False, allow_null=True
    )
    dependent_id = serializers.PrimaryKeyRelatedField(
        queryset=Dependent.objects.all(), source='dependent', write_only=True
    )

    statuses = CostApprovalStatusSerializer(many=True, read_only=True)
    logs = CostApprovalLogSerializer(many=True, read_only=True)
    costs = SettlementCostSerializer(many=True, read_only=True)

    open_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overspent = serializers.BooleanField(read_only=True)
    days_until_expiration = serializers.IntegerField(read_only=True)

    class Meta:
        model = CostApproval
        fields = [
            'id', 'dependent_id',
            'ordering_institution', 'ordering_institution_id',
            'executing_institution', 'executing_institution_id',
            'insurance', 'insurance_id',
            'valid_from', 'valid_to', 'case_number', 'coverage_type', 'document_id',
            'next_reminder', 'approved_amount', 'settled_amount', 'open_amount',
            'is_overspent', 'days_until_expiration',
            'statuses', 'logs', 'costs'
        ]
