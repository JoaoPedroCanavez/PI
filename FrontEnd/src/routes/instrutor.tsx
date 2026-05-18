import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getMe, logoutUser, type UserMeResponse } from "../lib/auth";
import { usuarios, treinos } from "../lib/mockData";

export const Route = createFileRoute("/instrutor")({
  component: InstrutorPage,
});

function InstrutorPage() {
  const navigate = useNavigate();

  // Estados para controle de sessão assíncrona
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Estados para gerenciamento de treinos
  const [lista, setLista] = useState(treinos);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoAluno, setNovoAluno] = useState<number>(2);
  const [novoDia, setNovoDia] = useState("Segunda-feira");

  // Validação da sessão com o Django
  useEffect(() => {
    async function verificarSessao() {
      try {
        const dadosUsuario = await getMe();
        
        // Garante que apenas instrutores usem esta tela
        if (dadosUsuario.role !== "instrutor") {
          navigate({ to: "/aluno" });
          return;
        }

        setUser(dadosUsuario);
      } catch (error) {
        // Token inválido ou ausente redireciona para a raiz
        navigate({ to: "/" });
      } finally {
        setLoadingUser(false);
      }
    }

    verificarSessao();
  }, [navigate]);

  // Limpa cookies HTTP seguros no Django
  async function sair() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Erro ao deslogar no servidor", error);
    } finally {
      navigate({ to: "/" });
    }
  }

  function criarTreino(e: React.FormEvent) {
    e.preventDefault();
    const novo = {
      id: lista.length + 1,
      alunoId: novoAluno,
      nome: novoNome,
      dia: novoDia,
      exercicios: [],
    };
    setLista([...lista, novo]);
    setNovoNome("");
    setMostrarForm(false);
    alert("Rotina de treino criada com sucesso!");
  }

  // Filtra a lista de mocks baseando-se no campo do mock estruturado original (.tipo)
  const alunos = usuarios.filter((u) => u.tipo === "aluno");

  // Trava visual de carregamento assíncrono
  if (loadingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
        <h2>Validando credenciais do instrutor...</h2>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <div className="header">
        <h1>GymTrack - Painel do Instrutor</h1>
        <div>
          <span style={{ marginRight: "15px" }}>Instrutor: {user.username}</span>
          <button onClick={sair}>Sair</button>
        </div>
      </div>

      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Rotinas de Treinos Cadastradas</h2>
          <button className="btn" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? "Cancelar" : "Novo Treino"}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={criarTreino} className="card" style={{ marginBottom: "20px" }}>
            <h3>Montar Novo Treino</h3>
            <div className="form-group">
              <label>Nome do Treino (Ex: Treino A - Hipertrofia)</label>
              <input
                className="input"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Selecionar Aluno</label>
              <select
                className="input"
                value={novoAluno}
                onChange={(e) => setNovoAluno(Number(e.target.value))}
              >
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} ({a.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Dia da Semana</label>
              <input
                className="input"
                value={novoDia}
                onChange={(e) => setNovoDia(e.target.value)}
                required
              />
            </div>
            <button className="btn" type="submit">
              Salvar Treino
            </button>
          </form>
        )}

        <div style={{ marginTop: 12 }}>
          {lista.map((t) => {
            const aluno = usuarios.find((u) => u.id === t.alunoId);
            return (
              <div key={t.id} className="card">
                <strong>{t.nome}</strong>
                <p style={{ margin: "4px 0", fontSize: 14 }}>
                  Aluno: {aluno ? aluno.nome : `ID #${t.alunoId}`} | Frequência: {t.dia}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                  {t.exercicios.length} exercício(s) vinculado(s)
                </p>
                {t.exercicios.length > 0 && (
                  <ul style={{ marginTop: 8, paddingLeft: "20px" }}>
                    {t.exercicios.map((ex: any) => (
                      <li key={ex.id} style={{ fontSize: 13, marginBottom: "2px" }}>
                        {ex.name || ex.nome} — {ex.series} séries de {ex.repeticoes} reps
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}