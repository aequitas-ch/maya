from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from dateutil.rrule import rrulestr
from datetime import datetime, time
import uuid

from .models import Appointment
from .serializers import AppointmentSerializer
from core.models import Dependent

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see appointments for their dependents
        return Appointment.objects.filter(dependent__users=self.request.user).order_by('start_date', 'start_time')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Explicit type conversion and validation to address SonarCloud hotspots
        data = request.data.copy()
        if 'recurrence_pattern' in data and data['recurrence_pattern']:
            data['recurrence_pattern'] = str(data['recurrence_pattern'])
        recurrence_pattern = data.get('recurrence_pattern')

        # Verify dependent belongs to user
        dependent_id = data.get('dependent')
        if not Dependent.objects.filter(id=dependent_id, users=request.user).exists():
            return Response({"detail": "Not authorized or dependent not found."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        if recurrence_pattern:
            try:
                # Parse the start_date and start_time to use as the base for the rrule
                start_date_str = data.get('start_date')
                start_time_str = data.get('start_time')

                # We need a naive datetime for dateutil rrule based on start_date/time
                dtstart = datetime.strptime(f"{start_date_str} {start_time_str}", "%Y-%m-%d %H:%M:%S" if len(start_time_str) > 5 else "%Y-%m-%d %H:%M")

                rule = rrulestr(recurrence_pattern, dtstart=dtstart)

                # Prevent DoS by limiting the number of occurrences
                MAX_OCCURRENCES = 100
                dates = []
                for dt in rule:
                    dates.append(dt)
                    if len(dates) >= MAX_OCCURRENCES:
                        break

                if not dates:
                    raise ValueError("Recurrence pattern yielded no dates.")

                series_id = uuid.uuid4()
                appointments = []

                with transaction.atomic():
                    institutions_data = serializer.validated_data.pop('institutions', [])
                    for dt in dates:
                        appt = Appointment(
                            dependent=serializer.validated_data['dependent'],
                            title=serializer.validated_data['title'],
                            start_date=dt.date(),
                            start_time=dt.time(),
                            end_time=serializer.validated_data['end_time'],
                            series_id=series_id
                        )
                        appt.save()
                        if institutions_data:
                            appt.institutions.set(institutions_data)
                        appointments.append(appt)

                return Response(AppointmentSerializer(appointments, many=True).data, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"detail": f"Invalid recurrence pattern: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        else:
            # Create a single appointment
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Returns the next 3 upcoming appointments across all user's dependents."""
        today = datetime.now().date()
        current_time = datetime.now().time()

        # Appointments today after current time OR appointments in the future
        queryset = self.get_queryset().filter(
            start_date__gte=today
        ).exclude(
            start_date=today, start_time__lt=current_time
        ).order_by('start_date', 'start_time')[:3]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
