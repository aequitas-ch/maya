from django.db import models
from core.models import Dependent
from settlement.models import Institution

class Document(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    dependent = models.ForeignKey(Dependent, on_delete=models.CASCADE, related_name='documents')
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')

    def __str__(self):
        return str(f"{self.name} - {self.dependent}")
