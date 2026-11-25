from django.db import models
from django.utils import timezone
from decimal import Decimal
from core.models import Dependent

class Institution(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Insurance(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class CostApproval(models.Model):
    COVERAGE_TYPES = [
        ('IV_GGV', 'IV Geburtsgebrechen'),
        ('IV_HILFSMITTEL', 'IV Hilfsmittel'),
        ('IV_ASSISTENZ', 'IV Assistenzbeitrag'),
        ('KVG_GRUND', 'Krankenkasse KVG'),
        ('VVG_ZUSATZ', 'Krankenkasse VVG'),
        ('STIFTUNG', 'Stiftung'),
        ('SELBSTZAHLER', 'Selbstzahler'),
    ]

    dependent = models.ForeignKey(Dependent, on_delete=models.CASCADE, related_name='cost_approvals')
    ordering_institution = models.ForeignKey(Institution, on_delete=models.PROTECT, related_name='ordered_approvals', null=True, blank=True)
    executing_institution = models.ForeignKey(Institution, on_delete=models.PROTECT, related_name='executed_approvals', null=True, blank=True)
    insurance = models.ForeignKey(Insurance, on_delete=models.PROTECT, related_name='approvals', null=True, blank=True)

    valid_from = models.DateField(null=True, blank=True, help_text="Gültigkeitsbeginn")
    valid_to = models.DateField(null=True, blank=True, help_text="Ablaufdatum der Bewilligung")
    case_number = models.CharField(max_length=100, blank=True, null=True, help_text="Verfügungsnummer / IV-Aktenzeichen")
    coverage_type = models.CharField(max_length=30, choices=COVERAGE_TYPES, default='IV_GGV')

    document_id = models.IntegerField(null=True, blank=True, help_text="FK zu documents.EncryptedDocument")

    next_reminder = models.DateField(null=True, blank=True)

    approved_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    settled_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    @property
    def open_amount(self):
        return self.approved_amount - self.settled_amount

    @property
    def is_overspent(self):
        return self.open_amount < 0

    @property
    def days_until_expiration(self):
        if self.valid_to:
            return (self.valid_to - timezone.now().date()).days
        return None

    def update_settled_amount(self):
        total = self.costs.filter(status='verguetet').aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
        self.settled_amount = total
        self.save(update_fields=['settled_amount'])

    def __str__(self):
        return f"Approval for {self.dependent} - {self.insurance}"

class CostApprovalStatus(models.Model):
    STATUS_CHOICES = [
        ('eingereicht', 'Eingereicht'),
        ('genehmigt', 'Genehmigt'),
        ('abgelehnt', 'Abgelehnt'),
        ('in_revision', 'In Revision'),
        ('vor_gericht', 'Vor Gericht'),
        ('abgerechnet', 'Abgerechnet'),
    ]

    cost_approval = models.ForeignKey(CostApproval, on_delete=models.CASCADE, related_name='statuses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    date = models.DateField()

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.cost_approval} - {self.get_status_display()} on {self.date}"

class CostApprovalLog(models.Model):
    cost_approval = models.ForeignKey(CostApproval, on_delete=models.CASCADE, related_name='logs')
    date = models.DateTimeField(auto_now_add=True)
    text = models.TextField()

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Log for {self.cost_approval} at {self.date}"

class SettlementCost(models.Model):
    COST_STATUS_CHOICES = [
        ('offen', 'Offen'),
        ('eingereicht', 'Eingereicht bei Kostenträger'),
        ('verguetet', 'Vergütet'),
        ('abgelehnt', 'Abgelehnt'),
    ]

    cost_approval = models.ForeignKey(CostApproval, on_delete=models.CASCADE, related_name='costs')
    invoice_number = models.CharField(max_length=100, blank=True, null=True, help_text="Rechnungsnummer")
    invoice_date = models.DateField(help_text="Rechnungsdatum")
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Rechnungsbetrag in CHF")
    paid_by_parents = models.BooleanField(default=False, help_text="Wurde von Eltern privat vorfinanziert")
    reimbursed_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Tatsächlich rückvergüteter Betrag")
    status = models.CharField(max_length=20, choices=COST_STATUS_CHOICES, default='offen')
    document_id = models.IntegerField(null=True, blank=True, help_text="FK zu documents.EncryptedDocument")
    comment = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-invoice_date']

    def __str__(self):
        return f"Cost for {self.cost_approval} - {self.amount} CHF"
