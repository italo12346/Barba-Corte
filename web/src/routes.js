import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./components/header";
import Sidebar from "./components/sideBar";
import './styelesGlobal.css';
import Clientes from './pages/Clientes';
import Agendamentos from './pages/Agendamento';

const AppRoutes = () => {
  return (
    <Router>
      <Header />
      <div className="container-fluid h-100">
        <div className="row h-100">
          <Routes>
            <Route path="/" element={<Agendamentos />} />
            <Route path="/clientes" element={<Clientes />} />
          </Routes>
          <Sidebar />
        </div>
      </div>
    </Router>
  );
};

export default AppRoutes;
