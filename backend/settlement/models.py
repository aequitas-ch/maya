from django.db import models
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
    dependent = models.ForeignKey(Dependent, on_delete=models.CASCADE, related_name='cost_approvals')
    ordering_institution = models.ForeignKey(Institution, on_delete=models.PROTECT, related_name='ordered_approvals')
    executing_institution = models.ForeignKey(Institution, on_delete=models.PROTECT, related_name='executed_approvals')
    insurance = models.ForeignKey(Insurance, on_delete=models.PROTECT, related_name='approvals')

    next_reminder = models.DateField(null=True, blank=True)

    approved_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    settled_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    @property
    def open_amount(self):
        return self.approved_amount - self.settled_amount

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
