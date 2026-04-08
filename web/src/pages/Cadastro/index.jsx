import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "rsuite";
import { useNavigate } from "react-router-dom";
import types from "../../store/modules/auth/authTypes";
import logo from '../../assets/Barba&cortedark.png';
import "./cadastro.css";

const Cadastro = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, autenticado } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    confirmarSenha: "",
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Redireciona após cadastro bem-sucedido
  useEffect(() => {
    if (autenticado) navigate("/");
  }, [autenticado, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro("");

    // ✅ Dispara o registro via Redux → saga → POST /auth/register
    dispatch({
      type: types.REGISTER_REQUEST,
      payload: {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        telefone: form.telefone,
      },
    });
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
            <input type="text" name="nome" value={form.nome} onChange={handleChange} required />
          </div>

          {/* ✅ Campo telefone adicionado — obrigatório no backend */}
          <div className="input-group">
            <label>Telefone</label>
            <input type="text" name="telefone" value={form.telefone} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
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
                className={`mdi ${mostrarSenha ? "mdi-eye-off-outline" : "mdi-eye-outline"} toggle-senha`}
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
                className={`mdi ${mostrarConfirmacao ? "mdi-eye-off-outline" : "mdi-eye-outline"} toggle-senha`}
                onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
              />
            </div>
          </div>

          {/* Erro local (senhas não coincidem) ou erro do backend */}
          {(erro || error) && (
            <div className="error-message">{erro || error}</div>
          )}

          <Button
            appearance="primary"
            type="submit"
            block
            loading={loading}
            className="cadastro-btn"
          >
            Criar Conta
          </Button>

          <p className="voltar-login">
            Já tem conta?{" "}
            <span onClick={() => navigate("/login")}>Fazer login</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;