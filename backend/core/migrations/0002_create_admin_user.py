from django.db import migrations
from django.contrib.auth.hashers import make_password
import os

def create_admin_user(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'aequitas-maya123$')

    if not User.objects.filter(username='admin').exists():
        User.objects.create(
            username='admin',
            email='admin@example.com',
            password=make_password(password),
            is_staff=True,
            is_superuser=True,
            is_active=True
        )

def remove_admin_user(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    User.objects.filter(username='admin').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, remove_admin_user),
    ]
