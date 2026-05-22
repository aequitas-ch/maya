from django.db import models
from core.models import Dependent

class HealthMetric(models.Model):
    name = models.CharField(max_length=100, unique=True)
    unit = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        if self.unit:
            return f"{self.name} ({self.unit})"
        return self.name

class HealthRecord(models.Model):
    dependent = models.ForeignKey(Dependent, on_delete=models.CASCADE, related_name='health_records')
    metric = models.ForeignKey(HealthMetric, on_delete=models.CASCADE, related_name='records')
    date = models.DateField()
    value = models.CharField(max_length=255)
    comment = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-date', '-id']

    def __str__(self):
        return f"{self.dependent} - {self.metric}: {self.value} on {self.date}"
