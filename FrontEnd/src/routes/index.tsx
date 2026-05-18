import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginUser } from "../lib/auth"; 
import { fetchApi } from "../services/api"; // Consome o endpoint raiz de utilizadores do Django
import { Dumbbell, User, Lock, Mail, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  
  // Estado que controla se a tela exibe o modo Login ou modo Registo
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Campos comuns a ambos os modos
  const [username, setUsername] = useState(""); 
  const [senha, setSenha] = useState("");
  
  // Campos exclusivos do modo de criação de cadastro
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"aluno" | "instrutor">("aluno");
  
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function executarFormulario(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      if (isRegistering) {
        // 1. Fluxo de Criação de Cadastro (POST para /user/)
        await fetchApi("/user/", {
          method: "POST",
          body: JSON.stringify({
            username,
            email,
            password: senha,
            role
          })
        });
        
        alert("Conta criada com sucesso! A efetuar autenticação automática...");
      }

      // 2. Fluxo de Autenticação Automática/Direta (POST para /user/login/)
      const response = await loginUser({ username, password: senha });
      
      // Redirecionamento baseado no cargo (role) retornado de forma segura pelo Django
      navigate({ to: response.role === "instrutor" ? "/instrutor" : "/aluno" });

    } catch (error: any) {
      setErro(error.message || "Ocorreu um erro ao processar a sua requisição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4 font-sans text-gray-800">
      
      {/* Cartão Principal em Vidro Translúcido (Glassmorphism) */}
      <div className="bg-white/50 backdrop-blur-xl border border-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        
        {/* Cabeçalho da Identidade Visual */}
        <div className="text-center space-y-2">
          <div className="bg-[#344956] p-3 rounded-2xl text-white shadow-lg shadow-[#344956]/20 mx-auto w-fit">
            <Dumbbell size={28} />
          </div>
          <h1 className="text-2xl font-black text-[#344956] tracking-tight">GymTrack</h1>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            {isRegistering ? "Criar Nova Conta" : "Acesso ao Sistema"}
          </p>
        </div>

        {/* Formulário Mutável */}
        <form onSubmit={executarFormulario} className="space-y-4">
          
          {/* Campo: Username */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Nome de Utilizador</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                required
                disabled={loading}
                type="text"
                placeholder="Ex: lucas_dev"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#344956] transition-all"
              />
            </div>
          </div>

          {/* Campo Opcional: E-mail (Apenas no modo Registo) */}
          {isRegistering && (
            <div className="animate-fade-in">
              <label className="text-xs font-bold text-gray-600 block mb-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  required
                  disabled={loading}
                  type="email"
                  placeholder="Ex: lucas@academia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#344956] transition-all"
                />
              </div>
            </div>
          )}

          {/* Campo: Senha */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                required
                disabled={loading}
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#344956] transition-all"
              />
            </div>
          </div>

          {/* Campo Opcional: Seleção de Cargo (Apenas no modo Registo) */}
          {isRegistering && (
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Tipo de Conta (Cargo)</label>
              <select
                disabled={loading}
                value={role}
                onChange={(e) => setRole(e.target.value as "aluno" | "instrutor")}
                className="w-full text-sm p-2.5 rounded-xl border bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#344956] transition-all text-gray-700 font-medium"
              >
                <option value="aluno">Aluno (Visualizar Fichas e Cargas)</option>
                <option value="instrutor">Instrutor (Montar e Vincular Treinos)</option>
              </select>
            </div>
          )}

          {/* Renderização Condicional de Mensagens de Erro */}
          {erro && (
            <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl border border-red-200 text-center">
              {erro}
            </div>
          )}

          {/* Botão de Submissão Estilizado */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#344956] hover:bg-[#25353e] text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-[#344956]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">A processar requisição...</span>
            ) : (
              <>
                {isRegistering ? "Criar Minha Conta" : "Entrar no Sistema"} <ArrowRight size={16} />
              </>
            )}
          </button>

        </form>

        {/* Alternador de Modos no Rodapé do Card */}
        <div className="text-center pt-4 border-t border-gray-300/40">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErro(""); // Limpa resíduos de erros passados
            }}
            className="text-xs text-[#344956] hover:text-[#25353e] font-bold transition-colors focus:outline-none"
          >
            {isRegistering 
              ? "Já possui um perfil ativo? Efetue o Login aqui" 
              : "Não tem uma conta cadastrada? Registe-se na plataforma"
            }
          </button>
        </div>

      </div>
    </div>
  );
}