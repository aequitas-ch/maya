from rest_framework import serializers
from .models import HealthMetric, HealthRecord
from core.models import Dependent

class HealthMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthMetric
        fields = ['id', 'name', 'unit']

class HealthRecordSerializer(serializers.ModelSerializer):
    metric = HealthMetricSerializer(read_only=True)
    metric_id = serializers.PrimaryKeyRelatedField(
        queryset=HealthMetric.objects.all(),
        source='metric',
        write_only=True,
        required=False
    )
    metric_name = serializers.CharField(write_only=True, required=False)
    metric_unit = serializers.CharField(write_only=True, required=False, allow_blank=True)
    dependent_id = serializers.PrimaryKeyRelatedField(
        queryset=Dependent.objects.all(),
        source='dependent',
        write_only=True
    )

    class Meta:
        model = HealthRecord
        fields = ['id', 'dependent_id', 'metric', 'metric_id', 'metric_name', 'metric_unit', 'date', 'value', 'comment']
        read_only_fields = ['id', 'metric']

    def validate(self, data):
        # Allow creating a record with an existing metric_id or providing a new metric_name
        if 'metric' not in data and 'metric_name' not in data:
            raise serializers.ValidationError("Either metric_id or metric_name must be provided.")
        return data

    def create(self, validated_data):
        metric_name = validated_data.pop('metric_name', None)
        metric_unit = validated_data.pop('metric_unit', None)

        if 'metric' not in validated_data and metric_name:
            metric, created = HealthMetric.objects.get_or_create(
                name=metric_name,
                defaults={'unit': metric_unit}
            )
            validated_data['metric'] = metric

        return super().create(validated_data)
