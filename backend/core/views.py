from rest_framework import generics, permissions, viewsets
from django.contrib.auth.models import User
from .models import Dependent
from .serializers import RegisterSerializer, ProfileSerializer, DependentSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user

class DependentViewSet(viewsets.ModelViewSet):
    serializer_class = DependentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.dependents.all()
