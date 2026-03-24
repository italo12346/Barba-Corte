import { useState } from "react";
import { Button } from "rsuite";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/Barba&cortedark.png';
import "./cadastro.css";

const Cadastro = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: ""
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro("");

    // Aqui depois você conecta com Redux / backend
    console.log("Dados cadastrados:", form);

    navigate("/login");
  };

  return (
    <div className="cadastro-wrapper">
      <div className="cadastro-card">

        <img src={logo} alt="Logo" className="cadastro-logo" />

        <h2>Criar Conta</h2>
        <p>Preencha os dados para se cadastrar</p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <div className="senha-wrapper">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={handleChange}
                required
              />
              <span
                className={`mdi ${
                  mostrarSenha
                    ? "mdi-eye-off-outline"
                    : "mdi-eye-outline"
                } toggle-senha`}
                onClick={() => setMostrarSenha(!mostrarSenha)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Confirmar Senha</label>
            <div className="senha-wrapper">
              <input
                type={mostrarConfirmacao ? "text" : "password"}
                name="confirmarSenha"
                value={form.confirmarSenha}
                onChange={handleChange}
                required
              />
              <span
                className={`mdi ${
                  mostrarConfirmacao
                    ? "mdi-eye-off-outline"
                    : "mdi-eye-outline"
                } toggle-senha`}
                onClick={() =>
                  setMostrarConfirmacao(!mostrarConfirmacao)
                }
              />
            </div>
          </div>

          {erro && (
            <div className="error-message">
              {erro}
            </div>
          )}

          <Button
            appearance="primary"
            type="submit"
            block
            className="cadastro-btn"
          >
            Criar Conta
          </Button>

          <p className="voltar-login">
            Já tem conta?{" "}
            <span onClick={() => navigate("/login")}>
              Fazer login
            </span>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Cadastro;
