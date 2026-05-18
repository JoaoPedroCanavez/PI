import { fetchApi } from '../services/api';
import type { UserMeResponse } from './auth';

export interface ExercicioCatalogo {
  id: number;
  nome: string;
}

export interface ItemTreino {
  id?: number;
  exercicio_id?: number; 
  exercicio?: ExercicioCatalogo; 
  series: number;
  repeticoes: string;
  carga_atual_kg?: string;
}

export interface Treino {
  id?: number;
  nome: string;
  dia_da_semana: string;
  itens: ItemTreino[];
}

export interface AtribuicaoTreino {
  id?: number;
  aluno_id?: number;
  treino_id?: number;
  aluno?: UserMeResponse;
  treino?: Treino;
  data_atribuicao?: string;
}

export interface HistoricoCarga {
  id?: number;
  exercicio_id?: number;
  exercicio_nome?: string;
  carga_kg: number;
  data_formatada?: string;
}
export async function getCatalogo() {
  return fetchApi<ExercicioCatalogo[]>('/treinos/catalogo/', { method: 'GET' });
}

export async function criarExercicio(nome: string) {
  return fetchApi<ExercicioCatalogo>('/treinos/catalogo/', {
    method: 'POST',
    body: JSON.stringify({ nome }),
  });
}

export async function getTreinos() {
  return fetchApi<Treino[]>('/treinos/', { method: 'GET' });
}

export async function criarTreino(dados: Treino) {
  return fetchApi<Treino>('/treinos/', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function getAlunos() {
  const usuarios = await fetchApi<UserMeResponse[]>('/user/', { method: 'GET' });
  return usuarios.filter(u => u.role === 'aluno');
}

export async function getAtribuicoes() {
  return fetchApi<AtribuicaoTreino[]>('/treinos/atribuir/', { method: 'GET' });
}

export async function criarAtribuicao(alunoId: number, treinoId: number) {
  return fetchApi<AtribuicaoTreino>('/treinos/atribuir/', {
    method: 'POST',
    body: JSON.stringify({ aluno_id: alunoId, treino_id: treinoId }),
  });
}


export async function getHistoricoCarga(alunoId?: number) {
  const url = alunoId ? `/treinos/historico/?aluno_id=${alunoId}` : '/treinos/historico/';
  return fetchApi<HistoricoCarga[]>(url, { method: 'GET' });
}

export async function registrarProgressoCarga(exercicioId: number, cargaKg: number) {
  return fetchApi<HistoricoCarga>('/treinos/historico/', {
    method: 'POST',
    body: JSON.stringify({ exercicio_id: exercicioId, carga_kg: cargaKg }),
  });
}

export async function atualizarTreino(id: number, dados: Treino) {
  return fetchApi<Treino>(`/treinos/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export async function desvincularTreinoAluno(atribuicaoId: number) {
  return fetchApi<void>(`/treinos/atribuir/${atribuicaoId}/`, {
    method: 'DELETE',
  });
}

export async function eliminarTreinoTemplate(id: number) {
  return fetchApi<void>(`/treinos/${id}/`, {
    method: 'DELETE',
  });
}

export async function getContatosContexto() {
  return fetchApi<UserMeResponse[]>('/user/', { method: 'GET' });
}