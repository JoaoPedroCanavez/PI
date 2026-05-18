from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import ExercicioCatalogo, Treino, ItemTreino, AtribuicaoTreino, HistoricoCarga
from user.serializers import UserResponseSerializer

User = get_user_model()

class ExercicioCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExercicioCatalogo
        fields = ['id', 'nome']

class ItemTreinoSerializer(serializers.ModelSerializer):
    
    exercicio_id = serializers.PrimaryKeyRelatedField(
        queryset=ExercicioCatalogo.objects.all(), source='exercicio', write_only=True
    )
    exercicio = ExercicioCatalogoSerializer(read_only=True)

    class Meta:
        model = ItemTreino
        fields = ['id', 'exercicio_id', 'exercicio', 'series', 'repeticoes', 'carga_atual_kg']

class TreinoSerializer(serializers.ModelSerializer):
    itens = ItemTreinoSerializer(many=True)

    class Meta:
        model = Treino
        fields = ['id', 'nome', 'dia_da_semana', 'itens']

    def create(self, validated_data):
        itens_data = validated_data.pop('itens')
        with transaction.atomic():
            treino = Treino.objects.create(**validated_data)
            for item_data in itens_data:
                ItemTreino.objects.create(treino=treino, **item_data)
        return treino

    def update(self, instance, validated_data):
        itens_data = validated_data.pop('itens', None)
        
        with transaction.atomic():

            instance.nome = validated_data.get('nome', instance.nome)
            instance.dia_da_semana = validated_data.get('dia_da_semana', instance.dia_da_semana)
            instance.save()

            if itens_data is not None:
                instance.itens.all().delete() # Remove todos os antigos da tabela filha
                for item_data in itens_data:
                    ItemTreino.objects.create(treino=instance, **item_data) # Insere os novos
                    
        return instance

class AtribuicaoTreinoSerializer(serializers.ModelSerializer):
    
    aluno_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='aluno'), source='aluno', write_only=True
    )
    treino_id = serializers.PrimaryKeyRelatedField(
        queryset=Treino.objects.all(), source='treino', write_only=True
    )
    aluno = UserResponseSerializer(read_only=True)
    treino = TreinoSerializer(read_only=True)

    class Meta:
        model = AtribuicaoTreino
        fields = ['id', 'aluno_id', 'treino_id', 'aluno', 'treino', 'data_atribuicao']
        
class HistoricoCargaSerializer(serializers.ModelSerializer):
    
    exercicio_id = serializers.PrimaryKeyRelatedField(
        queryset=ExercicioCatalogo.objects.all(), source='exercicio', write_only=True
    )
    exercicio_nome = serializers.CharField(source='exercicio.nome', read_only=True)
    data_formatada = serializers.DateTimeField(source='data_registro', format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = HistoricoCarga
        
        fields = ['id', 'exercicio_id', 'exercicio_nome', 'carga_kg', 'data_formatada']