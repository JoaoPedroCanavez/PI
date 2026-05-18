import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getMe, logoutUser, type UserMeResponse } from "../lib/auth";
import { treinos, historico as histInicial } from "../lib/mockData";

export const Route = createFileRoute("/aluno")({
  component: AlunoPage,
});

function AlunoPage() {
  const navigate = useNavigate();
  
  // Estados para controle de sessão assíncrona
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Estados locais da interface de treinos
  const [cargas, setCargas] = useState<Record<number, string>>({});
  const [historico, setHistorico] = useState(histInicial);

  // Validação da sessão com o Django
  useEffect(() => {
    async function verificarSessao() {
      try {
        const dadosUsuario = await getMe();
        
        // Garante que apenas alunos usem esta tela
        if (dadosUsuario.role !== "aluno") {
          navigate({ to: "/instrutor" });
          return;
        }
        
        setUser(dadosUsuario);
      } catch (error) {
        // Se o cookie expirou ou é inválido, manda para o login
        navigate({ to: "/" });
      } finally {
        setLoadingUser(false);
      }
    }

    verificarSessao();
  }, [navigate]);

  // Executa o logout limpando os cookies seguros no backend
  async function sair() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Erro ao limpar sessão no servidor", error);
    } finally {
      navigate({ to: "/" });
    }
  }

  function salvarCarga(exId: number, exNome: string) {
    if (!treino) return;
    const valor = cargas[exId];
    if (!valor) return;
    const hoje = new Date().toLocaleDateString("pt-BR");
    setHistorico([
      { data: hoje, treino: treino.nome, exercicio: exNome, carga: valor },
      ...historico,
    ]);
    alert("Carga registrada!");
  }

  // Busca o treino usando o ID do usuário retornado pelo Django
  const treino = user ? treinos.find((t) => t.alunoId === user.id) : null;

  // Trava visual enquanto valida a sessão
  if (loadingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
        <h2>Validando acesso...</h2>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <div className="header">
        <h1>GymTrack - Aluno</h1>
        <div>
          <span style={{ marginRight: "15px" }}>Aluno: {user.username}</span>
          <button onClick={sair}>Sair</button>
        </div>
      </div>

      <div className="container">
        <h2>Meu Treino do Dia</h2>
        {!treino ? (
          <p>Nenhum treino montado para você ainda. Fale com seu instrutor!</p>
        ) : (
          <div className="card">
            <h3>{treino.nome} - {treino.dia}</h3>
            <table style={{ width: "100%", marginTop: "12px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "8px" }}>Exercício</th>
                  <th style={{ padding: "8px" }}>Séries x Repetições</th>
                  <th style={{ padding: "8px" }}>Carga Atual (kg)</th>
                  <th style={{ padding: "8px" }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {treino.exercicios.map((ex) => (
                  <tr key={ex.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{ ex.nome}</td>
                    <td style={{ padding: "8px" }}>{ex.series}x{ex.repeticoes}</td>
                    <td style={{ padding: "8px" }}>
                      <input
                        className="input"
                        style={{ width: "80px" }}
                        type="number"
                        value={cargas[ex.id] || ""}
                        onChange={(e) =>
                          setCargas({ ...cargas, [ex.id]: e.target.value })
                        }
                        placeholder="Ex: 60"
                      />
                    </td>
                    <td style={{ padding: "8px" }}>
                      <button
                        className="btn"
                        onClick={() => salvarCarga(ex.id, ex.nome)}
                      >
                        Salvar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2>Histórico de Evolução</h2>
        <div className="card">
          {historico.length === 0 ? (
            <p>Nenhuma carga registrada anteriormente.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "8px" }}>Data</th>
                  <th style={{ padding: "8px" }}>Treino</th>
                  <th style={{ padding: "8px" }}>Exercício</th>
                  <th style={{ padding: "8px" }}>Carga</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{h.data}</td>
                    <td style={{ padding: "8px" }}>{h.treino}</td>
                    <td style={{ padding: "8px" }}>{h.exercicio}</td>
                    <td style={{ padding: "8px" }}>{h.carga} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}