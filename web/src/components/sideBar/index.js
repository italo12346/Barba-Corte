import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/Logo barba&corte.png';

const Sidebar = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
      if (window.innerWidth >= 1000) setMenuAberto(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const links = [
    { to: '/',              end: true, icon: 'mdi-calendar-check',              label: 'Agendamentos' },
    { to: '/clientes',             icon: 'mdi-account-multiple',             label: 'Clientes' },
    { to: '/colaboradores',        icon: 'mdi-card-account-details-outline', label: 'Colaboradores' },
    { to: '/servicos',             icon: 'mdi-content-cut',                  label: 'Serviços' },
    { to: '/horarios',             icon: 'mdi-clock',                        label: 'Horários' },
  ];

  // ── Desktop — sidebar original ────────────────────────────────────────────
  if (!isMobile) {
    return (
      <aside className="col-2 text-white">
        <img src={logo} alt="Logo" className="img-fluid px-3 py-4" />
        <ul className="list-unstyled px-3">
          {links.map(({ to, end, icon, label }) => (
            <li key={to} className="mb-3">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `text-white text-decoration-none d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <span className={`mdi ${icon} fs-5`} />
                <span className="ms-2">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  // ── Mobile — topbar + drawer ──────────────────────────────────────────────
  return (
    <>
      {/* Topbar fixa */}
      <nav className="sidebar-topbar">
        <img src={logo} alt="Logo" className="sidebar-topbar__logo" />
        <button
          onClick={() => setMenuAberto((prev) => !prev)}
          className="sidebar-topbar__btn"
          aria-label="Abrir menu"
        >
          <span className={`mdi ${menuAberto ? 'mdi-close' : 'mdi-menu'}`} />
        </button>
      </nav>

      {/* Overlay */}
      {menuAberto && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Drawer */}
      <aside className={`sidebar-drawer ${menuAberto ? 'sidebar-drawer--open' : ''}`}>
        <ul className="list-unstyled px-3 pt-3">
          {links.map(({ to, end, icon, label }) => (
            <li key={to} className="mb-3">
              <NavLink
                to={to}
                end={end}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) =>
                  `text-white text-decoration-none d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <span className={`mdi ${icon} fs-5`} />
                <span className="ms-2">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      {/* Espaçador para o conteúdo não ficar sob a topbar */}
      <div className="sidebar-spacer" />
    </>
  );
};

export default Sidebar;