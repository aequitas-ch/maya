from django.db import models
from django.contrib.auth import get_user_model
import uuid
import re
from django.core.exceptions import ValidationError
from decimal import Decimal

User = get_user_model()

def validate_ahv_number(value):
    pattern = re.compile(r'^756\.\d{4}\.\d{4}\.\d{2}$')
    if not pattern.match(value):
        raise ValidationError("AHV number must be in the format 756.xxxx.xxxx.xx")

class Employee(models.Model):
    EMPLOYMENT_TYPES = [
        ('IV_ASSISTANCE', 'IV Assistance'),
        ('DOMESTIC', 'Domestic Employee'),
        ('BABYSITTER', 'Babysitter'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='employees')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    ahv_number = models.CharField(max_length=16, validators=[validate_ahv_number], blank=True, null=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Contract(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='contract')
    hourly_wage = models.DecimalField(max_digits=8, decimal_places=2, help_text="Always uses hourly wage, no monthly salary.")
    target_hours_per_week = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    probation_period_months = models.IntegerField(default=3)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Contract for {self.employee}"

class WorkingHours(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='working_hours')
    year = models.IntegerField()
    month = models.IntegerField()
    basic_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    sick_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    holiday_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    expenses = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="Spesen")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('contract', 'year', 'month')

    def __str__(self):
        return f"{self.month}/{self.year} - {self.contract.employee}"

class Payslip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    working_hours = models.OneToOneField(WorkingHours, on_delete=models.CASCADE, related_name='payslip')

    # Financial fields
    gross_pay = models.DecimalField(max_digits=10, decimal_places=2)
    ahv_iv_eo_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    alv_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bvg_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    source_tax_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2)
    employer_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Nebenkosten des Arbeitgebers")

    pdf_document = models.FileField(upload_to='payslips/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payslip {self.working_hours.month}/{self.working_hours.year} - {self.working_hours.contract.employee}"
