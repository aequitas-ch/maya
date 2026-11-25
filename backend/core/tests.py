from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
import io
from PIL import Image

class RegisterCorsTests(APITestCase):
    def test_register_options_includes_cors_header(self):
        response = self.client.options(
            '/api/users/register/',
            HTTP_ORIGIN='http://localhost:3000',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.get('Access-Control-Allow-Origin'), '*')

class ProfileUploadTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.client.force_authenticate(user=self.user)

    def test_profile_picture_upload(self):
        # Create a dummy image
        file = io.BytesIO()
        image = Image.new('RGB', (100, 100), color=(73, 109, 137))
        image.save(file, 'jpeg')
        file.name = 'test_image.jpg'
        file.seek(0)

        # We need to send as multipart form data
        data = {
            'first_name': 'Test',
            'last_name': 'User',
            'profile_picture': file
        }

        response = self.client.put('/api/users/profile/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('profile_picture', response.data)
        self.assertTrue(response.data['profile_picture'].endswith('test_image.jpg') or response.data['profile_picture'].find('test_image') != -1)

from core.models import Profile, Dependent
from rest_framework.test import APIRequestFactory, force_authenticate
from core.views import DependentViewSet

class CoreSignalTests(APITestCase):
    def test_post_save_signal_creates_profile(self):
        user = User.objects.create_user(username='new_signal_user', password='password123')
        self.assertTrue(Profile.objects.filter(user=user).exists())

class DependentViewSetIsolationTests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username='user_a', password='testpassword123')
        self.user_b = User.objects.create_user(username='user_b', password='testpassword123')

        self.dep_a = Dependent.objects.create(first_name='Child', last_name='A')
        self.dep_a.users.add(self.user_a)

        self.dep_b = Dependent.objects.create(first_name='Child', last_name='B')
        self.dep_b.users.add(self.user_b)

        self.factory = APIRequestFactory()
        self.view = DependentViewSet.as_view({'get': 'list'})

    def test_tenant_isolation_get_queryset(self):
        request = self.factory.get('/api/dependents/')
        force_authenticate(request, user=self.user_a)
        response = self.view(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Assuming pagination or raw list, DRF uses pagination here:
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['first_name'], 'Child')
        self.assertEqual(results[0]['last_name'], 'A')
