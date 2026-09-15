from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, ContractViewSet, WorkingHoursViewSet, PayslipViewSet, DashboardViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'contracts', ContractViewSet, basename='contract')
router.register(r'working-hours', WorkingHoursViewSet, basename='working-hours')
router.register(r'payslips', PayslipViewSet, basename='payslip')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
