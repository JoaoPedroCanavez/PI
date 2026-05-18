import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getMe, logoutUser, type UserMeResponse } from "../lib/auth";
import { 
  getCatalogo, criarExercicio, getTreinos, criarTreino, atualizarTreino,
  getAlunos, getAtribuicoes, criarAtribuicao, desvincularTreinoAluno, eliminarTreinoTemplate,
  type Treino, type ExercicioCatalogo, type AtribuicaoTreino 
} from "../lib/treinos";
import { LogOut, Plus, Dumbbell, User as UserIcon, CheckCircle, FolderPlus, Link2, Trash2, Edit3, X } from "lucide-react";

export const Route = createFileRoute("/instrutor")({
  component: InstrutorPage,
});

function InstrutorPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados dos dados sincronizados com o banco
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [catalogo, setCatalogo] = useState<ExercicioCatalogo[]>([]);
  const [alunos, setAlunos] = useState<UserMeResponse[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<AtribuicaoTreino[]>([]);

  // Estado de controle das abas da interface
  const [abaAtiva, setAbaAtiva] = useState<'templates' | 'atribuicoes'>('templates');

  // Estado de controle de edição de modelos
  const [idTreinoSendoEditado, setIdTreinoSendoEditado] = useState<number | null>(null);

  // Estados dos formulários
  const [novoExercicioNome, setNovoExercicioNome] = useState("");
  const [nomeTreino, setNomeTreino] = useState("");
  const [diaTreino, setDiaTreino] = useState("Segunda-feira");
  const [itensForm, setItensForm] = useState<{ exercicio_id: number; exercicio_nome: string; series: number; repeticoes: string }[]>([]);
  
  // Seleções temporárias e chaves de envio para a API
  const [tempExercicioId, setTempExercicioId] = useState<number>(0);
  const [tempSeries, setTempSeries] = useState<number>(3);
  const [tempReps, setTempReps] = useState("10");

  const [alunoParaAtribuir, setAlunoParaAtribuir] = useState<number>(0);
  const [treinoParaAtribuir, setTreinoParaAtribuir] = useState<number>(0);

  // 1. Carga inicial dos dados contextuais do Instrutor
  useEffect(() => {
    async function carregarPainel() {
      try {
        const seguranca = await getMe();
        if (seguranca.role !== "instrutor") {
          navigate({ to: "/aluno" });
          return;
        }
        setUser(seguranca);

        const [cat, alu, tr, atr] = await Promise.all([
          getCatalogo(),
          getAlunos(),
          getTreinos(),
          getAtribuicoes()
        ]);

        setCatalogo(cat);
        setAlunos(alu);
        setTreinos(tr);
        setAtribuicoes(atr);

      } catch (error) {
        navigate({ to: "/" });
      } finally {
        setLoading(false);
      }
    }
    carregarPainel();
  }, [navigate]);

  // 🛠️ GANCHO DE ALINHAMENTO: Força a sincronização do select de treinos
  useEffect(() => {
    if (treinos.length > 0 && !treinos.some(t => t.id === treinoParaAtribuir)) {
      setTreinoParaAtribuir(treinos[0].id!);
    }
  }, [treinos, treinoParaAtribuir]);

  // 🛠️ GANCHO DE ALINHAMENTO: Força a sincronização do select de alunos vinculados
  useEffect(() => {
    if (alunos.length > 0 && !alunos.some(a => a.id === alunoParaAtribuir)) {
      setAlunoParaAtribuir(alunos[0].id);
    }
  }, [alunos, alunoParaAtribuir]);

  // 🛠️ GANCHO DE ALINHAMENTO: Força a sincronização do select de exercícios base
  useEffect(() => {
    if (catalogo.length > 0 && !catalogo.some(c => c.id === tempExercicioId)) {
      setTempExercicioId(catalogo[0].id);
    }
  }, [catalogo, tempExercicioId]);


  async function handleCriarExercicio(e: React.FormEvent) {
    e.preventDefault();
    if (!novoExercicioNome.trim()) return;
    try {
      const exSalvo = await criarExercicio(novoExercicioNome);
      setCatalogo([...catalogo, exSalvo]);
      setTempExercicioId(exSalvo.id);
      setNovoExercicioNome("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  function handleAddExercicioNoTemplate() {
    const alvo = catalogo.find(c => c.id === tempExercicioId);
    if (!alvo) return;
    setItensForm([...itensForm, {
      exercicio_id: alvo.id,
      exercicio_nome: alvo.nome,
      series: tempSeries,
      repeticoes: tempReps
    }]);
  }

  function handleRemoverExercicioDoTemplate(index: number) {
    const novaLista = [...itensForm];
    novaLista.splice(index, 1);
    setItensForm(novaLista);
  }

  function iniciarEdicaoTemplate(treino: Treino) {
    setIdTreinoSendoEditado(treino.id!);
    setNomeTreino(treino.nome);
    setDiaTreino(treino.dia_da_semana);
    
    const itensMapeados = treino.itens.map(it => ({
      exercicio_id: it.exercicio?.id || it.exercicio_id || 0,
      exercicio_nome: it.exercicio?.nome || "",
      series: it.series,
      repeticoes: it.repeticoes
    }));
    setItensForm(itensMapeados);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicao() {
    setIdTreinoSendoEditado(null);
    setNomeTreino("");
    setItensForm([]);
  }

  async function handleSalvarTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (itensForm.length === 0) return alert("Adicione exercícios ao modelo!");
    
    const payload: Treino = {
      nome: nomeTreino,
      dia_da_semana: diaTreino,
      itens: itensForm.map(i => ({ exercicio_id: i.exercicio_id, series: i.series, repeticoes: i.repeticoes }))
    };

    try {
      if (idTreinoSendoEditado) {
        const modeloAtualizado = await atualizarTreino(idTreinoSendoEditado, payload);
        setTreinos(treinos.map(t => t.id === idTreinoSendoEditado ? modeloAtualizado : t));
        setIdTreinoSendoEditado(null);
        alert("Template de treino modificado com sucesso!");
      } else {
        const modeloSalvo = await criarTreino(payload);
        setTreinos([...treinos, modeloSalvo]);
        alert("Template de treino salvo na biblioteca!");
      }
      setNomeTreino("");
      setItensForm([]);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleExecutarAtribuicao(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoParaAtribuir || !treinoParaAtribuir) {
      alert("Certifique-se de que selecionou um aluno e um template válido.");
      return;
    }
    try {
      const novaAtr = await criarAtribuicao(alunoParaAtribuir, treinoParaAtribuir);
      setAtribuicoes([...atribuicoes, novaAtr]);
      alert("Treino vinculado ao aluno com sucesso!");
    } catch (err: any) {
      alert(err.message || "Não foi possível atribuir o treino.");
    }
  }

  async function handleDesvincular(atribuicaoId: number) {
    if (!confirm("Tem certeza que deseja remover esta ficha do perfil do aluno?")) return;
    try {
      await desvincularTreinoAluno(atribuicaoId);
      setAtribuicoes(atribuicoes.filter(a => a.id !== atribuicaoId));
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleEliminarTemplate(id: number) {
    if (!confirm("Deseja eliminar este modelo permanentemente? Isso removerá o treino de todos os alunos vinculados.")) return;
    try {
      await eliminarTreinoTemplate(id);
      setTreinos(treinos.filter(t => t.id !== id));
      alert("Modelo de treino removido da biblioteca.");
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading || !user) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-[#344956] font-bold text-xl animate-bounce">Sincronizando Ecossistema...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8 font-sans text-gray-800">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto bg-white/50 backdrop-blur-md border border-white rounded-2xl p-6 flex justify-between items-center shadow-sm mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#344956] p-2.5 rounded-xl text-white shadow-md">
            <Dumbbell size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#344956] tracking-tight">GymTrack System</h1>
            <p className="text-xs text-gray-500 font-medium">Controle de Módulos e Fichas</p>
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

      {/* Menu de Abas */}
      <div className="max-w-6xl mx-auto flex gap-4 mb-6">
        <button 
          onClick={() => setAbaAtiva('templates')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${abaAtiva === 'templates' ? 'bg-[#344956] text-white shadow-lg' : 'bg-white/60 hover:bg-white text-[#344956]'}`}
        >
          1. Biblioteca de Modelos & Exercícios
        </button>
        <button 
          onClick={() => setAbaAtiva('atribuicoes')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${abaAtiva === 'atribuicoes' ? 'bg-[#344956] text-white shadow-lg' : 'bg-white/60 hover:bg-white text-[#344956]'}`}
        >
          2. Vinculação & Alunos Ativos
        </button>
      </div>

      <main className="max-w-6xl mx-auto">
        
        {abaAtiva === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6 lg:col-span-1">
              
              {/* Expandir Catálogo */}
              <div className="bg-white/70 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-sm text-[#344956] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FolderPlus size={16} /> Expandir Catálogo
                </h3>
                <form onSubmit={handleCriarExercicio} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ex: Leg Press 45º" 
                    value={novoExercicioNome}
                    onChange={e => setNovoExercicioNome(e.target.value)}
                    className="flex-1 text-sm p-2 rounded-lg border bg-white focus:outline-none"
                  />
                  <button type="submit" className="bg-[#344956] text-white px-3 rounded-lg text-xs font-bold hover:bg-[#25353e]">
                    Adicionar
                  </button>
                </form>
              </div>

              {/* Construtor de Templates */}
              <form onSubmit={handleSalvarTemplate} className="bg-white/70 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-sm text-[#344956] uppercase tracking-wider">
                    {idTreinoSendoEditado ? "Modificar Modelo" : "Novo Modelo de Treino"}
                  </h3>
                  {idTreinoSendoEditado && (
                    <button type="button" onClick={cancelarEdicao} className="text-red-500 hover:text-red-700 flex items-center gap-0.5 text-xs font-bold">
                      <X size={14} /> Cancelar
                    </button>
                  )}
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Nome do Padrão</label>
                  <input required value={nomeTreino} onChange={e => setNomeTreino(e.target.value)} placeholder="Ex: Hipertrofia Avançada A" className="w-full text-sm p-2 rounded-lg border focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Frequência/Dia Sugerido</label>
                  <input required value={diaTreino} onChange={e => setDiaTreino(e.target.value)} placeholder="Ex: Segunda-feira" className="w-full text-sm p-2 rounded-lg border focus:outline-none" />
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-[#344956] mb-2">Vincular Exercício ao Modelo</p>
                  <select value={tempExercicioId} onChange={e => setTempExercicioId(Number(e.target.value))} className="w-full text-sm p-2 rounded-lg border bg-white mb-2 focus:outline-none">
                    {catalogo.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <div className="flex gap-2 mb-2">
                    <input type="number" placeholder="Séries" value={tempSeries} onChange={e => setTempSeries(Number(e.target.value))} className="w-1/2 text-sm p-2 rounded-lg border text-center" />
                    <input type="text" placeholder="Reps" value={tempReps} onChange={e => setTempReps(e.target.value)} className="w-1/2 text-sm p-2 rounded-lg border text-center" />
                  </div>
                  <button type="button" onClick={handleAddExercicioNoTemplate} className="w-full bg-gray-200 hover:bg-gray-300 font-bold text-xs py-2 rounded-lg text-gray-700 transition-colors">
                    + Incluir na lista temporária
                  </button>
                </div>

                {itensForm.length > 0 && (
                  <div className="text-xs space-y-1 bg-white p-2.5 rounded-lg border">
                    <p className="font-bold text-gray-500 mb-1">Estrutura do Modelo:</p>
                    {itensForm.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-gray-700 font-medium py-0.5 border-b last:border-none">
                        <span>• {it.exercicio_nome} ({it.series}x{it.repeticoes})</span>
                        <button type="button" onClick={() => handleRemoverExercicioDoTemplate(idx)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className={`w-full text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition-colors ${idTreinoSendoEditado ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#344956] hover:bg-[#25353e]'}`}>
                  {idTreinoSendoEditado ? "Salvar Alterações no Modelo" : "Gravar na Biblioteca de Modelos"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-bold text-md text-[#344956] mb-3">Modelos Prontos na Biblioteca ({treinos.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treinos.map(t => (
                  <div key={t.id} className="bg-white/60 backdrop-blur-sm border border-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-[#344956] text-md">{t.nome}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-extrabold bg-[#344956]/10 text-[#344956] px-2 py-0.5 rounded-md">{t.dia_da_semana}</span>
                          <button onClick={() => handleEliminarTemplate(t.id!)} className="text-red-400 hover:text-red-600 p-0.5 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 bg-white/40 p-3 rounded-xl border">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ficha Técnica</p>
                        <ul className="space-y-1 text-xs">
                          {t.itens.map(it => (
                            <li key={it.id} className="flex justify-between font-medium text-gray-700">
                              <span>{it.exercicio?.nome}</span>
                              <span className="font-bold text-[#344956]">{it.series}x{it.repeticoes}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <button 
                      onClick={() => iniciarEdicaoTemplate(t)}
                      className="mt-4 w-full border border-amber-500 hover:bg-amber-500/10 text-amber-600 font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit3 size={12} /> Modificar Exercícios do Modelo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'atribuicoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <form onSubmit={handleExecutarAtribuicao} className="bg-white/70 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[#344956] uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                  <Link2 size={16} /> Vincular Prancha
                </h3>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Escolha o Aluno</label>
                  <select value={alunoParaAtribuir} onChange={e => setAlunoParaAtribuir(Number(e.target.value))} className="w-full text-sm p-2.5 rounded-lg border bg-white focus:outline-none">
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.username} ({a.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Selecione o Modelo de Treino</label>
                  <select value={treinoParaAtribuir} onChange={e => setTreinoParaAtribuir(Number(e.target.value))} className="w-full text-sm p-2.5 rounded-lg border bg-white focus:outline-none">
                    {treinos.map(t => <option key={t.id} value={t.id!}>{t.nome} ({t.dia_da_semana})</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-md">
                  Aplicar Ficha ao Perfil do Aluno
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-md text-[#344956]">Alunos e Fichas Ativas Atualmente ({atribuicoes.length})</h3>
              <div className="bg-white/60 backdrop-blur-sm border border-white rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100/80 border-b text-gray-600 font-bold">
                      <th className="p-3">Aluno</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3">Modelo Aplicado</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {atribuicoes.map(atr => (
                      <tr key={atr.id} className="hover:bg-white/40 transition-colors">
                        <td className="p-3 font-bold text-gray-800">{atr.aluno?.username}</td>
                        <td className="p-3 text-gray-600 text-xs">{atr.aluno?.email}</td>
                        <td className="p-3 font-semibold text-[#344956]">{atr.treino?.nome}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleDesvincular(atr.id!)}
                            className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                            title="Remover treino do aluno"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}