from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import EncryptedDocument
from django.core.files.uploadedfile import SimpleUploadedFile

class EncryptedDocumentViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.other_user = User.objects.create_user(username='otheruser', password='testpassword')

    def test_unauthenticated_access_denied(self):
        url = reverse('encrypteddocument-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_create_and_list_encrypted_document(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('encrypteddocument-list')

        file_content = b"encrypted content"
        mock_file = SimpleUploadedFile("encrypted.txt", file_content, content_type="application/octet-stream")

        data = {
            'title': 'My Encrypted Doc',
            'file': mock_file,
            'encrypted_dek': 'somebase64string',
            'iv': 'anotherbase64string',
            'mime_type': 'text/plain',
            'size_bytes': len(file_content)
        }

        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EncryptedDocument.objects.count(), 1)
        self.assertEqual(EncryptedDocument.objects.first().user, self.user)

        # Test isolation
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data.get('results', [])), 0)

        # Test list for owner
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data.get('results', [])), 1)
