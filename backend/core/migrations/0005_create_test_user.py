from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_test_user(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Profile = apps.get_model('core', 'Profile')

    if not User.objects.filter(username='test').exists():
        user = User.objects.create(
            username='test',
            email='test@test.com',
            password=make_password('Secure123$'),
            first_name='Test',
            last_name='User',
            is_active=True,
        )
        Profile.objects.update_or_create(
            user=user,
            defaults={'display_name': 'Test User'},
        )


def remove_test_user(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    User.objects.filter(username='test').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_profile_profile_picture'),
    ]

    operations = [
        migrations.RunPython(create_test_user, remove_test_user),
    ]
