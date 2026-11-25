from django.test import TestCase
from decimal import Decimal
from django.core.exceptions import ValidationError
from assistants.models import validate_ahv_number
from assistants.views import WorkingHoursViewSet
from assistants.models import Employee, Contract, WorkingHours, Payslip
from django.contrib.auth.models import User

class AssistantsQATests(TestCase):
    def test_ahv_number_validation(self):
        # Format 756.xxxx.xxxx.xx with EAN-13 check digit.
        # Note: the model validation is a simple regex
        with self.assertRaises(ValidationError):
            validate_ahv_number("123")
        with self.assertRaises(ValidationError):
            validate_ahv_number("756.1234.1234.1")
        validate_ahv_number("756.1234.1234.12")  # Valid format

    def test_payslip_calculator(self):
        # Setup data
        user = User.objects.create_user(username='employer', password='123')
        employee = Employee.objects.create(employer=user, first_name='Test', last_name='Emp', type='DOMESTIC')
        contract = Contract.objects.create(employee=employee, hourly_wage=Decimal('25.00'), start_date='2023-01-01')
        working_hours = WorkingHours.objects.create(
            contract=contract, year=2023, month=1,
            basic_hours=Decimal('40.00'), expenses=Decimal('10.00')
        )

        # Calculate manually
        gross_pay = (Decimal('40.00') * Decimal('25.00')) + Decimal('10.00') # 1010.00
        ahv = gross_pay * Decimal('0.053') # 53.53
        alv = gross_pay * Decimal('0.011') # 11.11
        net_pay = gross_pay - ahv - alv
        employer_costs = ahv + alv

        # Mock request to views generate_payslip
        from rest_framework.test import APIRequestFactory, force_authenticate
        factory = APIRequestFactory()
        request = factory.post(f'/api/working-hours/{working_hours.id}/generate_payslip/')
        force_authenticate(request, user=user)

        view = WorkingHoursViewSet.as_view({'post': 'generate_payslip'})
        response = view(request, pk=working_hours.id)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Decimal(str(response.data['gross_pay'])), gross_pay.quantize(Decimal('0.01')))
        self.assertEqual(Decimal(str(response.data['ahv_iv_eo_deduction'])), ahv.quantize(Decimal('0.01')))
        self.assertEqual(Decimal(str(response.data['alv_deduction'])), alv.quantize(Decimal('0.01')))
        self.assertEqual(Decimal(str(response.data['net_pay'])), net_pay.quantize(Decimal('0.01')))
