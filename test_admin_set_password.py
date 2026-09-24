import os
import sys
import django

# Set up Django environment
sys.path.append('/app/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aequitas.settings')
os.environ.setdefault('SECRET_KEY', 'test-key')
os.environ.setdefault('DATABASE_URL', 'sqlite:////app/backend/db.sqlite3')
os.environ.setdefault('DEBUG', 'True')
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIClient
from django.urls import reverse

client = APIClient()

# Create an admin user
admin_user, created = User.objects.get_or_create(username='admin_test', email='admin@test.com')
admin_user.set_password('adminpass')
admin_user.is_staff = True
admin_user.save()

# Create a regular user
regular_user, created = User.objects.get_or_create(username='regular_test', email='regular@test.com')
regular_user.set_password('oldpass')
regular_user.save()

# Login as admin
client.force_authenticate(user=admin_user)

# Call the new endpoint
url = f'/api/admin/users/{regular_user.id}/set_password/'
response = client.post(url, {'new_password': 'new_secure_password'})

print(f"Status Code: {response.status_code}")
print(f"Response: {response.data}")

# Verify the password was changed
regular_user.refresh_from_db()
if regular_user.check_password('new_secure_password'):
    print("SUCCESS: Password changed correctly.")
else:
    print("FAILED: Password was not changed.")
