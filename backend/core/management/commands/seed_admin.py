from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Profile

class Command(BaseCommand):
    help = 'Seed admin user'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='adminuser').exists():
            user = User.objects.create_superuser('adminuser', 'admin@example.com', 'adminpassword123')
            user.is_staff = True
            user.save()
            Profile.objects.create(user=user, display_name="Admin User")
            self.stdout.write(self.style.SUCCESS('Successfully created admin user'))
        else:
            user = User.objects.get(username='adminuser')
            user.set_password('adminpassword123')
            user.is_staff = True
            user.save()
            if not hasattr(user, 'profile'):
                Profile.objects.create(user=user, display_name="Admin User")
            self.stdout.write(self.style.WARNING('Admin user updated'))
