from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    display_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email', 'display_name')

    def create(self, validated_data):
        display_name = validated_data.pop('display_name', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        if hasattr(user, 'profile'):
            user.profile.display_name = display_name
            user.profile.save()
        return user

class ProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='profile.display_name', allow_blank=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'display_name')
        read_only_fields = ('username',)

    def update(self, instance, validated_data):
        # Extract profile data
        profile_data = validated_data.pop('profile', {})

        # Update user fields
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        # Update profile fields
        if hasattr(instance, 'profile'):
            profile = instance.profile
            profile.display_name = profile_data.get('display_name', profile.display_name)
            profile.save()

        return instance
