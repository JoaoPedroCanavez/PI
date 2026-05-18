from calendar import c

from django.contrib import admin

# Register your models here.
class TreinoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'descricao', 'repeticoes')
    search_fields = ('nome',)

class TreinoAlunoAdmin(admin.ModelAdmin):
    list_display = ('aluno', 'treino', 'data')
    search_fields = ('aluno__username', 'treino__nome')