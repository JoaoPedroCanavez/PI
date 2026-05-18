from django.core.exceptions import PermissionDenied, ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)

class TreinoService:
    def __init__(self):
        from .treino_repository import TreinoRepository
        self.repo = TreinoRepository()

    def listar_treinos(self, utilizador_logado):

        logger.info(f"Listagem de treinos solicitada por: {utilizador_logado.username} ({utilizador_logado.role})")
        
        if utilizador_logado.role == 'instrutor':
            return self.repo.get_all_treinos() 
        else:
            return self.repo.get_treinos_by_aluno(utilizador_logado.id)

    def criar_treino(self, utilizador_logado, serializer_validado):
        if utilizador_logado.role != 'instrutor':
            logger.warning(f"TENTATIVA DE INTRUSÃO: O aluno {utilizador_logado.username} tentou criar um treino.")
            raise PermissionDenied("Apenas instrutores têm permissão para criar rotinas de treino.")
        
        treino = serializer_validado.save()
        logger.info(f"Treino '{treino.nome}' criado pelo instrutor {utilizador_logado.username}.")
        return treino

    def eliminar_treino(self, utilizador_logado, treino_id: int):
        if utilizador_logado.role != 'instrutor':
            raise PermissionDenied("Apenas instrutores podem apagar treinos.")
        
        sucesso = self.repo.delete_treino(treino_id)
        if not sucesso:
            raise ObjectDoesNotExist(f"O treino com ID {treino_id} não existe ou já foi apagado.")
        
        logger.info(f"Treino {treino_id} apagado com sucesso.")
        return True