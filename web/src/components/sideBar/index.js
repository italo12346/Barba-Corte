import { NavLink } from 'react-router-dom';
import logo from '../../assets/Logo barba&corte.png';

const Sidebar = () => {
  return (
    <aside className="col-2 vh-100 text-white">

      <img
        src={logo}
        alt="Logo"
        className="img-fluid px-3 py-4"
      />

      <ul className="list-unstyled px-3">

        <li className="mb-3">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-white text-decoration-none d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <span className="mdi mdi-calendar-check fs-5"></span>
            <span className="ms-2">Agendamentos</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/clientes"
            className={({ isActive }) =>
              `text-white text-decoration-none d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <span className="mdi mdi-account-multiple fs-5"></span>
            <span className="ms-2">Clientes</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/colaboradores"
            className={({ isActive }) =>
              `text-white text-decoration-none d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <span className="mdi mdi-card-account-details-outline fs-5"></span>
            <span className="ms-2">Colaboradores</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/servicos"
            className={({ isActive }) =>
              `text-white text-decoration-none d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <span className="mdi mdi-content-cut fs-5"></span>
            <span className="ms-2">Serviços</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/horarios"
            className={({ isActive }) =>
              `text-white text-decoration-none d-flex align-items-center ${isActive ? 'active' : ''}`
            }
          >
            <span className="mdi mdi-clock fs-5"></span>
            <span className="ms-2">Horários</span>
          </NavLink>
        </li>

      </ul>

    </aside>
  );
};

export default Sidebar;
