from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('instrutor', 'Instrutor'),
        ('aluno', 'Aluno'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='aluno')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"