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

from django.contrib.auth.models import User

class EncryptedDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='encrypted_documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='encrypted_docs/') # Speichert reinen Chiffretext
    encrypted_dek = models.TextField() # Base64 verschlüsselter DEK
    iv = models.CharField(max_length=64) # Base64 Initialisierungsvektor
    mime_type = models.CharField(max_length=100)
    size_bytes = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(f"{self.title} (Encrypted) - {self.user.username}")
