from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Dependent, Translation

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
        fields = ('username', 'email', 'first_name', 'last_name', 'display_name', 'profile_picture', 'is_staff')
        read_only_fields = ('username', 'is_staff')

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

class DependentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependent
        fields = ['id', 'first_name', 'last_name', 'address', 'city', 'postal_code', 'main_diagnosis', 'ahv_number']

    def create(self, validated_data):
        user = self.context['request'].user
        dependent = Dependent.objects.create(**validated_data)
        dependent.users.add(user)
        return dependent

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')

class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = '__all__'
