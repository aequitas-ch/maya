from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Dependent

class Command(BaseCommand):
    help = 'Seeds dependents for test user'

    def handle(self, *args, **kwargs):
        user = User.objects.filter(username="test").first()
        if not user:
            self.stdout.write(self.style.ERROR('Run seed_test_user first.'))
            return

        # This is a mock AHV number for testing/seeding purposes.
        # Ensure that no real sensitive data is used here.
        dep, created = Dependent.objects.get_or_create(
            ahv_number="756.1234.5678.90",
            defaults={
                'first_name': 'Max',
                'last_name': 'Muster',
                'address': 'Teststrasse 1',
                'city': 'Zürich',
                'postal_code': '8000',
                'main_diagnosis': 'Asthma'
            }
        )
        dep.users.add(user)
        self.stdout.write(self.style.SUCCESS('Successfully seeded dependent'))
