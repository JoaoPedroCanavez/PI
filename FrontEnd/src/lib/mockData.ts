// Dados mockados simples para o projeto acadêmico GymTrack

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  tipo: "instrutor" | "aluno";
};

export type Exercicio = {
  id: number;
  nome: string;
  series: number;
  repeticoes: number;
  carga?: string;
};

export type Treino = {
  id: number;
  alunoId: number;
  nome: string;
  dia: string;
  exercicios: Exercicio[];
};

export type Historico = {
  data: string;
  treino: string;
  exercicio: string;
  carga: string;
};

export const usuarios: Usuario[] = [
  { id: 1, nome: "Rafael", email: "rafael@gymtrack.com", senha: "123456", tipo: "instrutor" },
  { id: 2, nome: "João", email: "joao@gymtrack.com", senha: "123456", tipo: "aluno" },
  { id: 3, nome: "Maria", email: "maria@gymtrack.com", senha: "123456", tipo: "aluno" },
  { id: 4, nome: "Pedro", email: "pedro@gymtrack.com", senha: "123456", tipo: "aluno" },
];

export const treinos: Treino[] = [
  {
    id: 1,
    alunoId: 2,
    nome: "Treino A - Peito e Tríceps",
    dia: "Segunda-feira",
    exercicios: [
      { id: 1, nome: "Supino Reto", series: 4, repeticoes: 10 },
      { id: 2, nome: "Supino Inclinado", series: 3, repeticoes: 12 },
      { id: 3, nome: "Crucifixo", series: 3, repeticoes: 12 },
      { id: 4, nome: "Tríceps Pulley", series: 4, repeticoes: 10 },
    ],
  },
  {
    id: 2,
    alunoId: 3,
    nome: "Treino B - Costas e Bíceps",
    dia: "Terça-feira",
    exercicios: [
      { id: 1, nome: "Puxada Frontal", series: 4, repeticoes: 10 },
      { id: 2, nome: "Remada Curvada", series: 3, repeticoes: 12 },
      { id: 3, nome: "Rosca Direta", series: 3, repeticoes: 12 },
    ],
  },
  {
    id: 3,
    alunoId: 4,
    nome: "Treino C - Pernas",
    dia: "Quarta-feira",
    exercicios: [
      { id: 1, nome: "Agachamento", series: 4, repeticoes: 10 },
      { id: 2, nome: "Leg Press", series: 4, repeticoes: 12 },
      { id: 3, nome: "Cadeira Extensora", series: 3, repeticoes: 15 },
    ],
  },
];

export const historico: Historico[] = [
  { data: "10/05/2026", treino: "Treino A", exercicio: "Supino Reto", carga: "60kg" },
  { data: "08/05/2026", treino: "Treino A", exercicio: "Supino Reto", carga: "55kg" },
  { data: "05/05/2026", treino: "Treino A", exercicio: "Supino Reto", carga: "55kg" },
];
