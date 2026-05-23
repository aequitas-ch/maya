from django.db import models
from django.contrib.auth.models import User

from django.core.validators import RegexValidator

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=150, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Dependent(models.Model):
    users = models.ManyToManyField(User, related_name='dependents')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    main_diagnosis = models.CharField(max_length=255)

    ahv_validator = RegexValidator(
        regex=r'^756\.\d{4}\.\d{4}\.\d{2}$',
        message='AHV number must be in the format 756.xxxx.xxxx.xx'
    )
    ahv_number = models.CharField(max_length=16, validators=[ahv_validator])

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
