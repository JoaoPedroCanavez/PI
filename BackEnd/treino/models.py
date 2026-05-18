from django.db import models

# Create your models here.
class Treino(models.Model):
    nome = models.CharField(max_length=100)
    repeticoes = models.CharField(max_length=20)
    descricao = models.TextField()

    def __str__(self):
        return self.nome
    
class TreinoAluno(models.Model):
    aluno = models.ForeignKey('user.User', on_delete=models.CASCADE)
    treino = models.ForeignKey(Treino, on_delete=models.CASCADE)
    data = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.aluno.username} - {self.treino.nome} ({self.data})"