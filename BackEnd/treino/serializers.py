from rest_framework import serializers
from .models import Treino
from .models import TreinoAluno

class TreinoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treino
        fields = '__all__'
        
class TreinoCreateUpdateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    nome = serializers.CharField(max_length=255)
    repeticoes = serializers.CharField(max_length=20)
    descricao = serializers.CharField()
    

class TreinoAlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreinoAluno
        fields = '__all__'
        
class TreinoAlunoCreateUpdateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    aluno = serializers.PrimaryKeyRelatedField(queryset=TreinoAluno.objects.all())
    treino = serializers.PrimaryKeyRelatedField(queryset=TreinoAluno.objects.all())
    data = serializers.DateField()
        
