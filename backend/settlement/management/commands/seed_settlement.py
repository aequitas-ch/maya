from django.core.management.base import BaseCommand
from settlement.models import Institution, Insurance

class Command(BaseCommand):
    help = 'Seeds initial reference data for settlement app (Institutions and Insurances)'

    def handle(self, *args, **kwargs):
        # Seed Institutions
        institutions = ['Kinderspital Zürich', 'Universitätsspital Basel', 'Inselspital Bern']
        for name in institutions:
            Institution.objects.get_or_create(name=name)

        # Seed Insurances
        insurances = ['IV-Stelle Zürich', 'IV-Stelle Bern', 'KPT', 'Helsana', 'CSS']
        for name in insurances:
            Insurance.objects.get_or_create(name=name)

        self.stdout.write(self.style.SUCCESS('Successfully seeded settlement data (Institutions and Insurances)'))
