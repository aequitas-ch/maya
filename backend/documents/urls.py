from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, EncryptedDocumentViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'encrypted-documents', EncryptedDocumentViewSet, basename='encrypteddocument')

urlpatterns = [
    path('', include(router.urls)),
]
