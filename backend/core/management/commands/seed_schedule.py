from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Dependent
from settlement.models import Institution
from schedule.models import Appointment
from datetime import datetime, timedelta, date, time
import random
import uuid

class Command(BaseCommand):
    help = 'Seeds the database with test appointments'

    def handle(self, *args, **kwargs):
        user = User.objects.filter(username="test").first()
        if not user:
            self.stdout.write(self.style.ERROR('No test user found. Run seed_test_user first.'))
            return

        dependents = user.dependents.all()

        if not dependents.exists():
            self.stdout.write(self.style.ERROR('No dependents found for test user.'))
            return

        institutions = list(Institution.objects.all())
        if not institutions:
             Institution.objects.create(name="Test Institution")
             institutions = list(Institution.objects.all())

        # Clear existing
        Appointment.objects.all().delete()

        today = date.today()
        created_count = 0

        # 1. Past appointments (attended/not attended)
        for i in range(3):
            dep = random.choice(dependents)
            days_ago = random.randint(1, 30)
            start_d = today - timedelta(days=days_ago)

            appt = Appointment.objects.create(
                dependent=dep,
                title=f"Past Therapy {i+1}",
                start_date=start_d,
                start_time=time(9 + i, 0),
                end_time=time(10 + i, 0),
                attended=random.choice([True, False]),
                comment="Seed comment for past appointment." if random.choice([True, False]) else ""
            )
            if institutions:
                appt.institutions.add(random.choice(institutions))
            created_count += 1

        # 2. Upcoming single appointments
        for i in range(4):
            dep = random.choice(dependents)
            days_ahead = random.randint(1, 14)
            start_d = today + timedelta(days=days_ahead)

            appt = Appointment.objects.create(
                dependent=dep,
                title=f"Upcoming Checkup {i+1}",
                start_date=start_d,
                start_time=time(14, 30),
                end_time=time(15, 30),
            )
            if institutions:
                appt.institutions.add(random.choice(institutions))
            created_count += 1

        # 3. Recurring series (weekly for 4 weeks)
        series_id = uuid.uuid4()
        dep = random.choice(dependents)
        for i in range(4):
            start_d = today + timedelta(days=(i * 7) + 2) # Start in 2 days, then weekly
            appt = Appointment.objects.create(
                dependent=dep,
                title="Weekly Physio",
                start_date=start_d,
                start_time=time(16, 0),
                end_time=time(17, 0),
                series_id=series_id
            )
            if institutions:
                appt.institutions.add(random.choice(institutions))
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} appointments'))
