from .models import Treino, ExercicioCatalogo, ItemTreino

class TreinoRepository:
    
    @staticmethod
    def get_all_treinos():
        
        return Treino.objects.prefetch_related(
            'itens', 
            'itens__exercicio'
        ).all()

    @staticmethod
    def get_treinos_by_aluno(aluno_id: int):
        return Treino.objects.filter(aluno_id=aluno_id).prefetch_related(
            'itens', 
            'itens__exercicio'
        )

    @staticmethod
    def get_treino_by_id(treino_id: int):
        try:
            return Treino.objects.prefetch_related('itens', 'itens__exercicio').get(id=treino_id)
        except Treino.DoesNotExist:
            return None

    @staticmethod
    def delete_treino(treino_id: int):
        treino = TreinoRepository.get_treino_by_id(treino_id)
        if treino:
            treino.delete()
            return True
        return False


class CatalogoRepository:
    @staticmethod
    def get_all_exercicios():
        return ExercicioCatalogo.objects.all().order_by('nome')
        
    @staticmethod
    def create_exercicio(nome: str):
        return ExercicioCatalogo.objects.create(nome=nome)