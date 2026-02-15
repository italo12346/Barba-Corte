import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "rsuite";
import { useNavigate } from "react-router-dom";
import * as actions from "../../store/modules/login/actions";
import logo from '../../assets/Barba&cortedark.png';
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, authenticated } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({
    email: "",
    senha: ""
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(actions.loginRequest(form.email, form.senha));
  };

  useEffect(() => {
    if (authenticated) {
      navigate("/");
    }
  }, [authenticated, navigate]);

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
                className={`mdi ${
                  mostrarSenha
                    ? "mdi-eye-off-outline"
                    : "mdi-eye-outline"
                } toggle-senha`}
                onClick={() => setMostrarSenha(!mostrarSenha)}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

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
            <span onClick={() => navigate("/cadastro")}>
              Cadastrar
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
