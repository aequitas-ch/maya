from rest_framework import serializers
from .models import Appointment
from core.models import Dependent
from settlement.serializers import InstitutionSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    institutions_details = InstitutionSerializer(source='institutions', many=True, read_only=True)
    dependent_name = serializers.SerializerMethodField(read_only=True)
    recurrence_pattern = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Limit the dependent choices to the current user's dependents to prevent IDOR
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            self.fields['dependent'].queryset = Dependent.objects.filter(users=request.user)

    class Meta:
        model = Appointment
        fields = [
            'id', 'dependent', 'dependent_name', 'institutions', 'institutions_details',
            'title', 'start_date', 'start_time', 'end_time', 'attended', 'comment',
            'series_id', 'recurrence_pattern'
        ]

    def get_dependent_name(self, obj):
        return f"{obj.dependent.first_name} {obj.dependent.last_name}"
