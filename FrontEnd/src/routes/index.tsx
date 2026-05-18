import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginUser } from "../lib/auth"; 

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); 
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false); // Novo state para desabilitar o botão enquanto carrega

  // A função agora é ASYNC
  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await loginUser({ username: username, password: senha });
      navigate({ to: response.role === "instrutor" ? "/instrutor" : "/aluno" });
    } catch (error: any) {
      setErro(error.message || "Ocorreu um erro ao tentar fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-box">
      <h1>GymTrack</h1>
      <p style={{ textAlign: "center", fontSize: 13, color: "#666" }}>
        Acesso ao Sistema
      </p>
      
      <form onSubmit={entrar}>
        <div className="form-group">
          <label>Nome de Usuário</label>
          <input
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Senha</label>
          <input
            className="input"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        {erro && <div className="error" style={{ color: "red", marginBottom: "10px" }}>{erro}</div>}
        
        <button className="btn" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}