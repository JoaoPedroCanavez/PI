# BackEnd/treino/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import PermissionDenied, ObjectDoesNotExist

from treino.models import AtribuicaoTreino, HistoricoCarga, Treino
from .serializers import AtribuicaoTreinoSerializer, HistoricoCargaSerializer, TreinoSerializer, ExercicioCatalogoSerializer
from .treino_service import TreinoService
from .treino_repository import CatalogoRepository

class TreinoListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'instrutor':
            # Regra: Instrutor só vê os modelos que ele mesmo criou
            treinos = Treino.objects.filter(criado_por=request.user).prefetch_related('itens', 'itens__exercicio')
        else:
            treinos = Treino.objects.filter(atribuido_a__aluno=request.user).prefetch_related('itens', 'itens__exercicio')
        serializer = TreinoSerializer(treinos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'instrutor':
            return Response({"error": "Apenas instrutores criam treinos."}, status=status.HTTP_403_FORBIDDEN)
        serializer = TreinoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(criado_por=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TreinoDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = TreinoService()

    def put(self, request, pk):
        try:
            treino = Treino.objects.get(pk=pk)
            # Garantia de escopo: Instrutor só edita o que é dele
            if treino.criado_por != request.user:
                return Response({"error": "Você não tem permissão para editar este modelo."}, status=status.HTTP_403_FORBIDDEN)
                
            serializer = TreinoSerializer(treino, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Treino.DoesNotExist:
            return Response({"error": "Modelo de treino não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            self.service.eliminar_treino(request.user, pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ObjectDoesNotExist as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)


class AtribuicaoListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'instrutor':
            atribuicoes = AtribuicaoTreino.objects.filter(aluno__instrutor=request.user).select_related('aluno', 'treino')
        else:
            atribuicoes = AtribuicaoTreino.objects.filter(aluno=request.user).select_related('aluno', 'treino')
        serializer = AtribuicaoTreinoSerializer(atribuicoes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'instrutor':
            return Response({"error": "Apenas instrutores vinculam treinos."}, status=status.HTTP_403_FORBIDDEN)
        
        aluno_id = request.data.get('aluno_id')
        from django.contrib.auth import get_user_model
        UserModel = get_user_model()
        
        try:
            aluno = UserModel.objects.get(id=aluno_id, role='aluno')
            if aluno.instrutor != request.user:
                return Response(
                    {"error": "Ação proibida. Este aluno pertence a outro instrutor ou não tem mentor associado."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        except UserModel.DoesNotExist:
            return Response({"error": "Aluno não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AtribuicaoTreinoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🛠️ CLASSE RESTAURADA: Resolve o problema do ImportError do servidor
class AtribuicaoDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'instrutor':
            return Response({"error": "Apenas instrutores desvinculam treinos."}, status=status.HTTP_403_FORBIDDEN)
        try:
            atribuicao = AtribuicaoTreino.objects.get(pk=pk)
            if atribuicao.aluno.instrutor != request.user:
                return Response({"error": "Você não tem permissão para remover o treino deste aluno."}, status=status.HTTP_403_FORBIDDEN)
                
            atribuicao.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except AtribuicaoTreino.DoesNotExist:
            return Response({"error": "Vínculo de treino não encontrado."}, status=status.HTTP_404_NOT_FOUND)


class CatalogoListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        exercicios = CatalogoRepository.get_all_exercicios()
        serializer = ExercicioCatalogoSerializer(exercicios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'instrutor':
            return Response({"error": "Apenas instrutores cadastram exercícios base."}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = ExercicioCatalogoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HistoricoCargaListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        aluno_id = request.query_params.get('aluno_id')
        
        if request.user.role == 'instrutor' and aluno_id:
            historico = HistoricoCarga.objects.filter(aluno_id=aluno_id).select_related('exercicio')
        else:
            historico = HistoricoCarga.objects.filter(aluno=request.user).select_related('exercicio')
            
        serializer = HistoricoCargaSerializer(historico, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = HistoricoCargaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(aluno=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)