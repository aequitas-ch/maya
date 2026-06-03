from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'dependent', 'start_date', 'start_time', 'end_time', 'attended')
    list_filter = ('start_date', 'dependent', 'attended')
    search_fields = ('title', 'dependent__first_name', 'dependent__last_name')
