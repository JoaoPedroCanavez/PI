from django.db import models
from django.conf import settings

class ExercicioCatalogo(models.Model):
    
    nome = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nome

class Treino(models.Model):
    nome = models.CharField(max_length=100) 
    dia_da_semana = models.CharField(max_length=20) 
    
    criado_por = models.ForeignKey(
        'user.User', 
        on_delete=models.CASCADE, 
        related_name='templates_criados',
        null=True,
        blank=True
    )

class ItemTreino(models.Model):
    
    treino = models.ForeignKey(Treino, on_delete=models.CASCADE, related_name='itens')
    exercicio = models.ForeignKey(ExercicioCatalogo, on_delete=models.PROTECT)
    series = models.IntegerField(default=3)
    repeticoes = models.CharField(max_length=20)
    carga_atual_kg = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)

    def __str__(self):
        return f"{self.exercicio.nome} ({self.series}x{self.repeticoes})"

class AtribuicaoTreino(models.Model):
    
    aluno = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='atribuicoes')
    treino = models.ForeignKey(Treino, on_delete=models.CASCADE, related_name='atribuido_a')
    data_atribuicao = models.DateTimeField(auto_now_add=True)

    class Meta:

        unique_together = ('aluno', 'treino') 

    def __str__(self):
        return f"{self.treino.nome} -> {self.aluno.username}"
    
class HistoricoCarga(models.Model):
    
    aluno = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='historico_cargas'
    )
    exercicio = models.ForeignKey(ExercicioCatalogo, on_delete=models.CASCADE)
    carga_kg = models.DecimalField(max_digits=5, decimal_places=1)
    data_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data_registro'] # O mais recente aparece sempre primeiro

    def __str__(self):
        return f"{self.aluno.username} - {self.exercicio.nome}: {self.carga_kg}kg"