# BackEnd/treino/urls.py
from django.urls import path
from .views import HistoricoCargaListCreateView, TreinoListCreateView, TreinoDetailView, CatalogoListCreateView, AtribuicaoListCreateView, AtribuicaoDetailView

urlpatterns = [
    path('catalogo/', CatalogoListCreateView.as_view(), name='catalogo-list-create'),
    path('atribuir/', AtribuicaoListCreateView.as_view(), name='treino-atribuir'),
    path('atribuir/<int:pk>/', AtribuicaoDetailView.as_view(), name='treino-desvincular'), # <-- NOVA ROTA AQUI
    path('', TreinoListCreateView.as_view(), name='treino-list-create'),
    path('<int:pk>/', TreinoDetailView.as_view()),
    path('historico/', HistoricoCargaListCreateView.as_view()),
]