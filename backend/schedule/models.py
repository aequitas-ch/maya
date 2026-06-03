from django.db import models
import uuid

class Appointment(models.Model):
    dependent = models.ForeignKey('core.Dependent', on_delete=models.CASCADE, related_name='appointments')
    institutions = models.ManyToManyField('settlement.Institution', related_name='appointments', blank=True)

    title = models.CharField(max_length=200)
    start_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    # Tracking for past appointments
    attended = models.BooleanField(null=True, blank=True)
    comment = models.TextField(blank=True)

    # Grouping for recurring appointments
    series_id = models.UUIDField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.dependent.first_name} {self.dependent.last_name} on {self.start_date}"
