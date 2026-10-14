from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import SettlementCost

@receiver([post_save, post_delete], sender=SettlementCost)
def update_cost_approval_balance_on_cost_change(sender, instance, **kwargs):
    if instance.cost_approval:
        instance.cost_approval.update_settled_amount()
