from rest_framework import status
from rest_framework.test import APITestCase


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
