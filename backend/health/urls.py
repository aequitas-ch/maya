from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HealthMetricViewSet, HealthRecordViewSet

router = DefaultRouter()
router.register(r'metrics', HealthMetricViewSet, basename='health-metric')
router.register(r'records', HealthRecordViewSet, basename='health-record')

urlpatterns = [
    path('', include(router.urls)),
]
