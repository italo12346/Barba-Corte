import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "rsuite";
import { useNavigate } from "react-router-dom";
import types from "../../store/modules/auth/authTypes";
import logo from '../../assets/Barba&cortedark.png';
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ "autenticado" — nome usado no reducer gerado
  const { loading, error, autenticado } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", senha: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ✅ dispara o type diretamente, sem depender de actions.js externo
    dispatch({ type: types.LOGIN_REQUEST, payload: { email: form.email, senha: form.senha } });
  };

  useEffect(() => {
    if (autenticado) navigate("/");
  }, [autenticado, navigate]);

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <img src={logo} alt="Logo" className="login-logo" />

        <h2>Bem-vindo</h2>
        <p>Faça login para continuar</p>

        <form onSubmit={handleSubmit}>
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
                className={`mdi ${mostrarSenha ? "mdi-eye-off-outline" : "mdi-eye-outline"} toggle-senha`}
                onClick={() => setMostrarSenha(!mostrarSenha)}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <Button
            appearance="primary"
            type="submit"
            block
            loading={loading}
            className="login-btn"
          >
            Entrar
          </Button>

          <p className="voltar-login">
            Não tem conta?{" "}
            <span onClick={() => navigate("/cadastro")}>Cadastrar</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;