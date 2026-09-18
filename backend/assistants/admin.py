from django.contrib import admin
from .models import Employee, Contract, WorkingHours, Payslip

admin.site.register(Employee)
admin.site.register(Contract)
admin.site.register(WorkingHours)
admin.site.register(Payslip)
