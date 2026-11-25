from django.contrib import admin
from .models import Institution, Insurance, CostApproval, CostApprovalStatus, CostApprovalLog, SettlementCost

admin.site.register(Institution)
admin.site.register(Insurance)
admin.site.register(CostApprovalStatus)
admin.site.register(CostApprovalLog)

class SettlementCostInline(admin.TabularInline):
    model = SettlementCost
    extra = 1

@admin.register(CostApproval)
class CostApprovalAdmin(admin.ModelAdmin):
    list_display = ('dependent', 'insurance', 'valid_from', 'valid_to', 'coverage_type', 'approved_amount', 'settled_amount')
    inlines = [SettlementCostInline]

@admin.register(SettlementCost)
class SettlementCostAdmin(admin.ModelAdmin):
    list_display = ('cost_approval', 'invoice_number', 'invoice_date', 'amount', 'status', 'paid_by_parents')
    list_filter = ('status', 'paid_by_parents')
    search_fields = ('invoice_number', 'cost_approval__dependent__first_name')
