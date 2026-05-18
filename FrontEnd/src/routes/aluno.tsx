import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getMe, logoutUser, vincularInstrutor, type UserMeResponse } from "../lib/auth";
import { getAtribuicoes, getHistoricoCarga, registrarProgressoCarga, getContatosContexto, type AtribuicaoTreino, type HistoricoCarga } from "../lib/treinos";
import { LogOut, Dumbbell, User as UserIcon, Calendar, Scale, Send, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/aluno")({
  component: AlunoPage,
});

function AlunoPage() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [atribuicoes, setAtribuicoes] = useState<AtribuicaoTreino[]>([]);
  const [historicoReal, setHistoricoReal] = useState<HistoricoCarga[]>([]);
  const [listaInstrutores, setListaInstrutores] = useState<UserMeResponse[]>([]);
  
  const [idInstrutorEscolhido, setIdInstrutorEscolhido] = useState<number>(0);
  const [inputsCarga, setInputsCarga] = useState<Record<number, string>>({});

  async function carregarDadosCompletos() {
    try {
      const dadosUsuario = await getMe();
      if (dadosUsuario.role !== "aluno") {
        navigate({ to: "/instrutor" });
        return;
      }
      setUser(dadosUsuario);
      
      const [dadosAtribuicoes, dadosHistorico, instrutoresDoBanco] = await Promise.all([
        getAtribuicoes(),
        getHistoricoCarga(),
        getContatosContexto() // Retorna todos os instrutores cadastrados
      ]);
      
      setAtribuicoes(dadosAtribuicoes);
      setHistoricoReal(dadosHistorico);
      setListaInstrutores(instrutoresDoBanco);

      if (dadosUsuario.instrutor_id) {
        setIdInstrutorEscolhido(dadosUsuario.instrutor_id);
      } else if (instrutoresDoBanco.length > 0) {
        setIdInstrutorEscolhido(instrutoresDoBanco[0].id);
      }
    } catch (error) {
      navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDadosCompletos();
  }, [navigate]);

  async function handleSalvarMentor() {
    try {
      const userAtualizado = await vincularInstrutor(idInstrutorEscolhido || null);
      setUser(userAtualizado);
      alert("Instrutor oficial atualizado! Fichas de treino sincronizadas.");
      window.location.reload(); // Recarrega para computar as pranchas do novo instrutor
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleRegistrarCarga(exercicioId: number) {
    const valorDigitado = inputsCarga[exercicioId];
    if (!valorDigitado || isNaN(Number(valorDigitado))) return alert("Insira um valor numérico.");
    try {
      const novoLog = await registrarProgressoCarga(exercicioId, Number(valorDigitado));
      setHistoricoReal([novoLog, ...historicoReal]);
      setInputsCarga({ ...inputsCarga, [exercicioId]: "" });
      alert("Carga guardada!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading || !user) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-[#344956] font-bold text-xl animate-pulse">Sincronizando Fichas...</div>
    </div>
  );

  // Encontra o objeto do instrutor atual
  const instrutorAtual = listaInstrutores.find(i => i.id === user.instrutor_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8 font-sans text-gray-800">
      
      {/* Header */}
      <header className="max-w-4xl mx-auto bg-white/50 backdrop-blur-md border border-white rounded-2xl p-6 flex justify-between items-center shadow-sm mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#344956] p-2.5 rounded-xl text-white shadow-md">
            <Dumbbell size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#344956] tracking-tight">GymTrack Aluno</h1>
            <p className="text-xs text-gray-500 font-medium">Painel de Evolução Direta</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold bg-white px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-[#344956]">
            <UserIcon size={16} /> {user.username}
          </span>
          <button onClick={() => logoutUser().then(() => navigate({ to: "/" }))} className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        
        {/* CARTÃO SELETOR DE INSTRUTOR */}
        <section className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <h3 className="font-black text-[#344956] text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-amber-500" /> Meu Treinador Responsável
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              {instrutorAtual ? `Seu treino está sendo monitorado por: ${instrutorAtual.username}` : "Você ainda não escolheu um instrutor técnico."}
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <select 
              value={idInstrutorEscolhido} 
              onChange={e => setIdInstrutorEscolhido(Number(e.target.value))}
              className="text-sm p-2 rounded-xl border bg-white focus:outline-none max-w-xs w-full"
            >
              {listaInstrutores.map(i => <option key={i.id} value={i.id}>{i.username} ({i.email})</option>)}
            </select>
            <button onClick={handleSalvarMentor} className="bg-[#344956] hover:bg-[#25353e] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md">
              Vincular
            </button>
          </div>
        </section>

        {/* Listagem de Treinos Liberados pelo Mentor Escolhido */}
        <section>
          <h2 className="text-lg font-black text-[#344956] mb-4 uppercase tracking-wider">As Minhas Rotinas Ativas</h2>
          {atribuicoes.length === 0 ? (
            <div className="bg-white/60 border rounded-2xl p-8 text-center text-gray-500 shadow-sm">
              Nenhuma ficha vinculada ao seu perfil pelo seu instrutor atual.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {atribuicoes.map((atr) => (
                <div key={atr.id} className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl shadow-md overflow-hidden">
                  <div className="bg-[#344956] px-5 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-md">{atr.treino?.nome}</h3>
                    <span className="text-[10px] uppercase font-extrabold bg-white text-[#344956] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Calendar size={12} /> {atr.treino?.dia_da_semana}
                    </span>
                  </div>
                  
                  <div className="p-5">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-xs text-gray-400 border-b">
                          <th className="pb-2 font-bold">Exercício</th>
                          <th className="pb-2 font-bold text-center">Meta</th>
                          <th className="pb-2 font-bold text-right">Registar Peso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {atr.treino?.itens.map((item) => (
                          <tr key={item.id} className="hover:bg-white/30 transition-colors">
                            <td className="py-3 font-semibold text-gray-700">{item.exercicio?.nome}</td>
                            <td className="py-3 font-black text-gray-500 text-center">{item.series}x{item.repeticoes}</td>
                            <td className="py-2 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <input 
                                  type="text" 
                                  placeholder="kg"
                                  value={inputsCarga[item.exercicio?.id!] || ""}
                                  onChange={e => setInputsCarga({ ...inputsCarga, [item.exercicio?.id!]: e.target.value })}
                                  className="w-14 text-center p-1 border rounded-md text-xs font-bold focus:outline-none bg-white"
                                />
                                <button onClick={() => handleRegistrarCarga(item.exercicio?.id!)} className="bg-[#344956] text-white p-1.5 rounded-md">
                                  <Send size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Histórico Real */}
        <section>
          <h2 className="text-lg font-black text-[#344956] mb-4 uppercase tracking-wider">Histórico de Cargas</h2>
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl overflow-hidden shadow-sm">
            {historicoReal.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">Agradecemos que registe a sua primeira carga acima.</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100/80 border-b text-gray-600 font-bold">
                    <th className="p-3">Data/Hora</th>
                    <th className="p-3">Exercício Mapeado</th>
                    <th className="p-3 text-right">Carga Superada</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {historicoReal.map((log) => (
                    <tr key={log.id} className="hover:bg-white/40 transition-colors">
                      <td className="p-3 text-gray-500 text-xs font-medium">{log.data_formatada}</td>
                      <td className="p-3 font-bold text-gray-800">{log.exercicio_nome}</td>
                      <td className="p-3 text-right font-black text-green-700">{log.carga_kg} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}