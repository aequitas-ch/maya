from rest_framework import serializers
from .models import Document
from settlement.serializers import InstitutionSerializer

class DocumentSerializer(serializers.ModelSerializer):
    # Make institution detail available for reading, but accept ID for writing
    institution_detail = InstitutionSerializer(source='institution', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'name', 'description', 'file', 'uploaded_at', 'dependent', 'institution', 'institution_detail']
        read_only_fields = ['id', 'uploaded_at']

from .models import EncryptedDocument

class EncryptedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EncryptedDocument
        fields = ['id', 'user', 'title', 'file', 'encrypted_dek', 'iv', 'mime_type', 'size_bytes', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
