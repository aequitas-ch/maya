from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from .models import CostApproval, SettlementCost
from core.models import Dependent

class CostApprovalCalculationTests(TestCase):
    def setUp(self):
        self.dependent = Dependent.objects.create(first_name="Test", last_name="Child")
        self.approval = CostApproval.objects.create(
            dependent=self.dependent,
            approved_amount=Decimal('1000.00'),
            valid_from=timezone.now().date(),
            valid_to=(timezone.now() + timezone.timedelta(days=30)).date()
        )

    def test_initial_amounts(self):
        self.assertEqual(self.approval.approved_amount, Decimal('1000.00'))
        self.assertEqual(self.approval.settled_amount, Decimal('0.00'))
        self.assertEqual(self.approval.open_amount, Decimal('1000.00'))
        self.assertFalse(self.approval.is_overspent)

    def test_add_costs_updates_settled_amount(self):
        # Create a settled cost (verguetet)
        SettlementCost.objects.create(
            cost_approval=self.approval,
            invoice_date=timezone.now().date(),
            amount=Decimal('300.00'),
            status='verguetet'
        )

        # Create an open cost (offen)
        SettlementCost.objects.create(
            cost_approval=self.approval,
            invoice_date=timezone.now().date(),
            amount=Decimal('200.00'),
            status='offen'
        )

        self.approval.refresh_from_db()
        self.assertEqual(self.approval.settled_amount, Decimal('300.00'))
        self.assertEqual(self.approval.open_amount, Decimal('700.00'))

    def test_change_cost_status_updates_settled_amount(self):
        cost = SettlementCost.objects.create(
            cost_approval=self.approval,
            invoice_date=timezone.now().date(),
            amount=Decimal('500.00'),
            status='offen'
        )

        self.approval.refresh_from_db()
        self.assertEqual(self.approval.settled_amount, Decimal('0.00'))

        cost.status = 'verguetet'
        cost.save()

        self.approval.refresh_from_db()
        self.assertEqual(self.approval.settled_amount, Decimal('500.00'))
        self.assertEqual(self.approval.open_amount, Decimal('500.00'))

    def test_delete_cost_updates_settled_amount(self):
        cost = SettlementCost.objects.create(
            cost_approval=self.approval,
            invoice_date=timezone.now().date(),
            amount=Decimal('400.00'),
            status='verguetet'
        )

        self.approval.refresh_from_db()
        self.assertEqual(self.approval.settled_amount, Decimal('400.00'))

        cost.delete()

        self.approval.refresh_from_db()
        self.assertEqual(self.approval.settled_amount, Decimal('0.00'))

    def test_is_overspent(self):
        SettlementCost.objects.create(
            cost_approval=self.approval,
            invoice_date=timezone.now().date(),
            amount=Decimal('1200.00'),
            status='verguetet'
        )

        self.approval.refresh_from_db()
        self.assertEqual(self.approval.settled_amount, Decimal('1200.00'))
        self.assertTrue(self.approval.is_overspent)
