from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Dependent, Profile

class Command(BaseCommand):
    help = 'Seeds a test user and links them to dependents with the last name "Muster"'

    def handle(self, *args, **kwargs):
        username = 'test'
        email = 'test@test.com'
        first_name = 'Test'
        last_name = 'User'
        password = 'Secure123$'

        # Create or update the user
        user, created = User.objects.get_or_create(username=username, defaults={'email': email})

        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.set_password(password)
        user.save()

        # Create or update the profile
        Profile.objects.get_or_create(user=user, defaults={'display_name': f"{first_name} {last_name}"})

        if created:
            self.stdout.write(self.style.SUCCESS(f'Successfully created test user "{username}".'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Successfully updated test user "{username}".'))

        # Find dependents with last name 'Muster'
        muster_dependents = Dependent.objects.filter(last_name='Muster')

        if muster_dependents.exists():
            for dependent in muster_dependents:
                dependent.users.add(user)
                self.stdout.write(self.style.SUCCESS(f'Successfully linked dependent "{dependent.first_name} {dependent.last_name}" to user "{username}".'))
        else:
            self.stdout.write(self.style.WARNING('No dependents with last name "Muster" found. None were linked.'))
