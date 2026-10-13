from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstitutionViewSet, InsuranceViewSet, CostApprovalViewSet, SettlementCostViewSet

router = DefaultRouter()
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'insurances', InsuranceViewSet, basename='insurance')
router.register(r'cost-approvals', CostApprovalViewSet, basename='cost-approval')
router.register(r'settlement-costs', SettlementCostViewSet, basename='settlement-cost')

urlpatterns = [
    path('', include(router.urls)),
]
