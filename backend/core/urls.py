from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, ProfileView, ChangePasswordView, DependentViewSet, AdminUserViewSet, TranslationViewSet

router = DefaultRouter()
router.register(r'dependents', DependentViewSet, basename='dependent')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'translations', TranslationViewSet, basename='translations')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]
