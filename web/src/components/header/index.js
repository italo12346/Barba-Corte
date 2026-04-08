import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import types from "../../store/modules/auth/authTypes";
import { NavLink } from "react-router-dom";

const Header = () => {
  const { salao } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="container-fluid d-flex justify-content-end align-items-center">
      <div
        className="d-flex h-100 align-items-center gap-2 position-relative"
        ref={dropdownRef}
      >
        <div className="text-end text-white">
          <span className="d-block fw-bold py-1">
            {salao?.nome || "Meu Salão"}
          </span>
          <small className="opacity-75 ">Plano Gold</small>
        </div>

        <div className="avatar">
          {salao?.foto ? (
            <img src={salao.foto} alt="avatar" className="avatar-img" />
          ) : (
            <div className="avatar-fallback">
              {salao?.nome?.charAt(0)?.toUpperCase() || "S"}
            </div>
          )}
        </div>

        {/* 🔽 Trigger */}
        <span
          className="mdi mdi-chevron-down text-white fs-4"
          style={{ cursor: "pointer" }}
          onClick={() => setOpen(!open)}
        />

        {/* 📦 Dropdown */}
        {open && (
          <div
            className="position-absolute bg-white shadow rounded"
            style={{
              top: "60px",
              right: 0,
              minWidth: "150px",
              zIndex: 1000,
            }}
          >
            <NavLink
              to="/perfil"
              className="dropdown-item d-flex align-items-center gap-2 text-dark"
            >
              <span className="mdi mdi-account" />
              Perfil
            </NavLink>
            <button
              onClick={() => dispatch({ type: types.LOGOUT })}
              className="dropdown-item d-flex align-items-center gap-2 text-dark"
            >
              <span className="mdi mdi-logout" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
