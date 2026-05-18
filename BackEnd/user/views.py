from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user.user_service import UserService
from .serializers import UserCreateUpdateSerializer, UserResponseSerializer
import logging

logger = logging.getLogger(__name__)


def set_auth_cookies(response, access_token, refresh_token=None):
    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,      
        secure=False,       
        samesite='Lax',       
        max_age=15 * 60       
    )
    
    if refresh_token:
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,    
            samesite='Lax',
            max_age=7 * 24 * 60 * 60 
        )
    return response


class LoginView(TokenObtainPairView):
    
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            logger.warning("Tentativa de login com credenciais inválidas.")
            return Response(
                {"error": "Credenciais inválidas ou formato incorreto."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        
        response = Response(
            {
                "message": "Login realizado com sucesso!",
                "role": serializer.user.role,
                "username": serializer.user.username
            }, 
            status=status.HTTP_200_OK
        )
        
        return set_auth_cookies(response, data['access'], data['refresh'])


class CustomTokenRefreshView(TokenRefreshView):
    
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {"error": "Refresh token não encontrado. Faça login novamente."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        serializer = self.get_serializer(data={'refresh': refresh_token})
        
        try:
            serializer.is_valid(raise_exception=True)
        except (TokenError, InvalidToken):
            return Response(
                {"error": "Sessão expirada ou token inválido. Faça login novamente."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        data = serializer.validated_data
        response = Response(
            {"message": "Sessão renovada com sucesso!"}, 
            status=status.HTTP_200_OK
        )
        
        return set_auth_cookies(response, data['access'], data.get('refresh'))

class LogoutView(APIView):
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from rest_framework_simplejwt.tokens import RefreshToken
        
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except TokenError:
            pass
            
        response = Response(
            {"message": "Logout realizado com sucesso!"}, 
            status=status.HTTP_200_OK
        )

        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
    


class UserMeView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        serializer = UserResponseSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        if request.user.role != 'aluno':
            return Response({"error": "Apenas alunos vinculam instrutores."}, status=status.HTTP_400_BAD_REQUEST)
        
        instrutor_id = request.data.get('instrutor_id')
        if instrutor_id:
            try:
                from django.contrib.auth import get_user_model
                UserModel = get_user_model()
                instrutor = UserModel.objects.get(id=instrutor_id, role='instrutor')
                request.user.instrutor = instrutor
                request.user.save()
            except UserModel.DoesNotExist:
                return Response({"error": "Instrutor não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        else:
            request.user.instrutor = None
            request.user.save()
            
        return Response(UserResponseSerializer(request.user).data, status=status.HTTP_200_OK)


class UserListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        from django.contrib.auth import get_user_model
        self.UserModel = get_user_model()
        
        # CORREÇÃO: Inicializa o serviço para que o método post volte a funcionar!
        self.user_service = UserService() 

    def get(self, request):
        # FILTRO DE SEGURANÇA CONTEXTUAL:
        if request.user.role == 'instrutor':
            users = self.UserModel.objects.filter(role='aluno', instrutor=request.user)
        else:
            users = self.UserModel.objects.filter(role='instrutor')
            
        serializer = UserResponseSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        logger.info(f"Recebida requisição POST para criação de usuário: {request.data.get('username')}")
        
        serializer = UserCreateUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.warning(f"Payload inválido para criação de usuário: {serializer.errors}")
            return Response({"error": "Dados inválidos.", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = self.user_service.create_user(serializer.validated_data)
            response_data = UserResponseSerializer(user).data
            return Response({"message": "Usuário criado com sucesso!", "data": response_data}, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            logger.warning(f"Regra de negócio violada ao criar usuário: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error("Erro interno inesperado ao tentar criar usuário.", exc_info=True)
            return Response({"error": "Erro interno ao criar usuário."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.user_service = UserService()

    def get(self, request, pk):
        try:
            user = self.user_service.get_user_by_id(pk)
            return Response(UserResponseSerializer(user).data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        serializer = UserCreateUpdateSerializer(data=request.data, partial=True)
        
        if not serializer.is_valid():
            return Response({"error": "Dados inválidos.", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_user = self.user_service.update_user(pk, serializer.validated_data)
            return Response(UserResponseSerializer(updated_user).data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            self.user_service.delete_user(pk)
            return Response({"message": "Usuário deletado com sucesso."}, status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)