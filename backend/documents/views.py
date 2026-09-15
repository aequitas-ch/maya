import os
from django.conf import settings
from django.core.files.base import ContentFile
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from cryptography.fernet import Fernet
from .models import Document
from .serializers import DocumentSerializer
from core.models import Dependent

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see documents for dependents they are linked to
        return Document.objects.filter(dependent__users=self.request.user)

    def perform_create(self, serializer):
        dependent = serializer.validated_data.get('dependent')
        # Validate that the user is linked to the dependent
        if not dependent.users.filter(id=self.request.user.id).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to add documents to this dependent.")

        # Encrypt the file
        file_obj = self.request.FILES.get('file')
        if file_obj:
            try:
                # Initialize Fernet with the encryption key from settings
                fernet = Fernet(settings.DOCUMENT_ENCRYPTION_KEY.encode())

                # Read the original file data
                file_data = file_obj.read()

                # Encrypt the data
                encrypted_data = fernet.encrypt(file_data)

                # Replace the file object with a new one containing the encrypted data
                encrypted_file = ContentFile(encrypted_data, name=file_obj.name)

                # Update the validated data to use the encrypted file
                serializer.validated_data['file'] = encrypted_file
            except Exception as e:
                from rest_framework.exceptions import APIException
                raise APIException(f"Encryption failed: {str(e)}")

        serializer.save()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        document = self.get_object()

        try:
            # Initialize Fernet with the encryption key from settings
            fernet = Fernet(settings.DOCUMENT_ENCRYPTION_KEY.encode())

            # Read the encrypted file data
            document.file.open('rb')
            encrypted_data = document.file.read()
            document.file.close()

            # Decrypt the data
            decrypted_data = fernet.decrypt(encrypted_data)

            # Create the response
            response = HttpResponse(decrypted_data, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(document.file.name)}"'
            return response
        except Exception as e:
            return Response({'error': f'Decryption failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
