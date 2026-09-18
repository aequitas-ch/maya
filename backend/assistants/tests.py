from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal
from .models import Employee, Contract, WorkingHours, Payslip

User = get_user_model()

class AssistantsTests(TestCase):
    def setUp(self):
        # Default Django user model requires username unless customized
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='testpassword')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.employee = Employee.objects.create(
            employer=self.user,
            first_name='Test',
            last_name='User',
            ahv_number='756.1234.5678.90',
            type='IV_ASSISTANCE'
        )

        self.contract = Contract.objects.create(
            employee=self.employee,
            hourly_wage=Decimal('35.00'),
            start_date='2023-01-01'
        )

    def test_create_working_hours_and_payslip(self):
        wh_data = {
            'contract': self.contract.id,
            'year': 2023,
            'month': 10,
            'basic_hours': 40,
            'expenses': 10
        }
        response = self.client.post('/api/assistants/working-hours/', wh_data)
        self.assertEqual(response.status_code, 201)
        wh_id = response.data['id']

        # Generate payslip
        ps_response = self.client.post(f'/api/assistants/working-hours/{wh_id}/generate_payslip/')
        self.assertEqual(ps_response.status_code, 201)

        # 40 hours * 35.00 + 10 = 1410.00
        self.assertEqual(Decimal(ps_response.data['gross_pay']), Decimal('1410.00'))

    def test_dashboard_data(self):
        # Create some data
        wh = WorkingHours.objects.create(
            contract=self.contract,
            year=2023,
            month=10,
            basic_hours=10
        )
        Payslip.objects.create(
            working_hours=wh,
            gross_pay=Decimal('350.00'),
            net_pay=Decimal('300.00'),
            employer_costs=Decimal('20.00')
        )

        response = self.client.get('/api/assistants/dashboard/?year=2023')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['monthly_costs']), 12)
        month_10 = next(m for m in response.data['monthly_costs'] if m['month'] == 10)
        # gross (350) + employer_costs (20) = 370
        self.assertEqual(month_10['total_cost'], 370)
