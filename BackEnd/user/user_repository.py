from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class UserRepository:
    @staticmethod
    def get_by_username(username: str):
        try:
            logger.info(f"Buscando usuário por username: {username}")
            return User.objects.get(username=username)
        except User.DoesNotExist:
            logger.warning(f"Usuário com username {username} não encontrado.")
            return None

    @staticmethod
    def get_by_email(email: str):
        try:
            logger.info(f"Buscando usuário por email: {email}")
            return User.objects.get(email=email)
        except User.DoesNotExist:
            logger.warning(f"Usuário com email {email} não encontrado.")
            return None

    @staticmethod
    def get_by_id(user_id: int):
        try:
            logger.info(f"Buscando usuário por ID: {user_id}")
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.warning(f"Usuário com ID {user_id} não encontrado.")
            return None

    @staticmethod
    def get_all():
        logger.info("Buscando todos os usuários.")
        return User.objects.all()

    @staticmethod
    def create(data: dict):
        logger.info(f"Criando novo usuário com email: {data.get('email')}")
        return User.objects.create_user(**data)

    @staticmethod
    def update(user, data: dict):
        logger.info(f"Atualizando usuário: {user.username} (ID: {user.id})")
        for field, value in data.items():
            setattr(user, field, value)
        user.save()
        return user

    @staticmethod
    def delete(user):
        logger.info(f"Deletando usuário: {user.username} (ID: {user.id})")
        user.delete()