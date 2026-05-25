from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Dependent

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

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class ProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='profile.display_name', allow_blank=True, required=False)
    profile_picture = serializers.ImageField(source='profile.profile_picture', required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'display_name', 'profile_picture')
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
            if 'profile_picture' in profile_data:
                profile.profile_picture = profile_data['profile_picture']
            profile.save()

        return instance

import re
class DependentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependent
        fields = ['id', 'first_name', 'last_name', 'address', 'city', 'postal_code', 'main_diagnosis', 'ahv_number', 'is_encrypted']

    def validate_ahv_number(self, value):
        is_encrypted = self.initial_data.get('is_encrypted', False)
        # Convert to boolean if it's a string from form data
        if isinstance(is_encrypted, str):
            is_encrypted = is_encrypted.lower() in ('true', '1', 't')

        if not is_encrypted:
            if not re.match(r'^756\.\d{4}\.\d{4}\.\d{2}$', value):
                raise serializers.ValidationError('AHV number must be in the format 756.xxxx.xxxx.xx')
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        dependent = Dependent.objects.create(**validated_data)
        dependent.users.add(user)
        return dependent
