import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "rsuite";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google'; // ✅ Importação do Google
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

  // ✅ Sucesso no Google: Dispara a Saga com o Token
  const handleGoogleSuccess = (credentialResponse) => {
    dispatch({ 
      type: types.GOOGLE_LOGIN_REQUEST, 
      payload: { token: credentialResponse.credential } 
    });
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

          {/* ✅ Divisor Visual */}
          <div style={{ margin: '20px 0', textAlign: 'center', borderBottom: '1px solid #ddd', lineHeight: '0.1em' }}>
            <span >ou</span>
          </div>

          {/* ✅ Botão do Google */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Erro no Login Google')}
              useOneTap
              theme="filled_blue"
              shape="pill"
              locale="pt_BR"
            />
          </div>

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
