import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styelesGlobal.css";

import Clientes from "./pages/Clientes";
import Agendamentos from "./pages/Agendamento";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";

import PrivateLayout from "./layouts/PrivateLayout";
import Colaboradores from "./pages/colaboradores";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>

        {/* ROTA PÚBLICA */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />


        {/* ROTAS PRIVADAS */}
        <Route
          path="/"
          element={
            <PrivateLayout>
              <Agendamentos />
            </PrivateLayout>
          }
        />

        <Route
          path="/clientes"
          element={
            <PrivateLayout>
              <Clientes />
            </PrivateLayout>
          }
        />
        <Route
          path="/colaboradores"
          element={
            <PrivateLayout>
              <Colaboradores />
            </PrivateLayout>
          }
        />

      </Routes>
    </Router>
  );
};

export default AppRoutes;
