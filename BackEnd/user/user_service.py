from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self):
        from user.user_repository import UserRepository
        self.repo = UserRepository()

    def create_user(self, data: dict):
        logger.info(f"Iniciando criação de usuário com email: {data.get('email')}")
        
        if self.repo.get_by_email(data.get('email')):
            logger.warning(f"Falha na criação: E-mail {data.get('email')} já existe.")
            raise ValueError("Este e-mail já está em uso.")
            
        if self.repo.get_by_username(data.get('username')):
            logger.warning(f"Falha na criação: Username {data.get('username')} já existe.")
            raise ValueError("Este nome de usuário já está em uso.")

        user = self.repo.create(data)
        logger.info(f"Usuário {user.username} criado com sucesso no banco (ID: {user.id}).")
        return user

    def get_all_users(self):
        return self.repo.get_all()

    def get_user_by_id(self, user_id: int):
        user = self.repo.get_by_id(user_id)
        if not user:
            logger.warning(f"Usuário com ID {user_id} não encontrado.")
            raise ObjectDoesNotExist("Usuário não encontrado.")
        logger.info(f"Usuário encontrado: {user.username} (ID: {user.id}).")
        return user

    def update_user(self, user_id: int, data: dict):
        user = self.get_user_by_id(user_id)

        new_email = data.get('email')
        if new_email and new_email != user.email:
            if self.repo.get_by_email(new_email):
                raise ValueError("Este e-mail já está sendo usado por outra conta.")

        if 'password' in data:
            data.pop('password')

        logger.info(f"Atualizando usuário: {user.username} (ID: {user.id}).")
        return self.repo.update(user, data)

    def delete_user(self, user_id: int):
        user = self.get_user_by_id(user_id)
        self.repo.delete(user)