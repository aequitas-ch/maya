from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, ProfileView, DependentViewSet

router = DefaultRouter()
router.register(r'dependents', DependentViewSet, basename='dependent')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]
