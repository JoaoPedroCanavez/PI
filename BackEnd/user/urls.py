from django.urls import path
from .views import (
    LoginView, 
    CustomTokenRefreshView, 
    LogoutView, 
    UserListCreateView, 
    UserDetailView,
    UserMeView
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='token_logout'),
    path('', UserListCreateView.as_view(), name='user-list-create'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('me/', UserMeView.as_view(), name='user-me')
]