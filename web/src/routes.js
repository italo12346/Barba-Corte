import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styelesGlobal.css";
import { useSelector } from "react-redux";

import Clientes from "./pages/Clientes";
import Agendamentos from "./pages/Agendamento";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import PrivateLayout from "./layouts/PrivateLayout";
import Colaboradores from "./pages/Colaboradores";
import ServicosPage from "./pages/Servicos";
import Horario from "./pages/Horarios";

// ✅ PrivateRoute inline — sem precisar de arquivo separado
const PrivateRoute = ({ children }) => {
  const { autenticado } = useSelector((s) => s.auth);
  return autenticado ? children : <Navigate to="/login" replace />;
};

// ✅ PublicRoute — redireciona para / se já estiver logado
const PublicRoute = ({ children }) => {
  const { autenticado } = useSelector((s) => s.auth);
  return autenticado ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* ROTAS PÚBLICAS */}
        <Route path="/login"   element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />

        {/* ROTAS PRIVADAS */}
        <Route path="/" element={<PrivateRoute><PrivateLayout><Agendamentos /></PrivateLayout></PrivateRoute>} />
        <Route path="/clientes" element={<PrivateRoute><PrivateLayout><Clientes /></PrivateLayout></PrivateRoute>} />
        <Route path="/colaboradores" element={<PrivateRoute><PrivateLayout><Colaboradores /></PrivateLayout></PrivateRoute>} />
        <Route path="/servicos" element={<PrivateRoute><PrivateLayout><ServicosPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/horarios" element={<PrivateRoute><PrivateLayout><Horario /></PrivateLayout></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;