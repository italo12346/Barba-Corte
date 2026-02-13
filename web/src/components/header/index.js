const Header = () => {
  return (
    <header className="container-fluid d-flex justify-content-end align-items-center ">
      <div className="d-flex h-100 align-items-center gap-2">
        
        <div className="text-end text-white">
          <span className="d-block fw-bold">Barba & Corte</span>
          <small className="opacity-75">Plano Gold</small>
        </div>

        <img
          src="https://cdn-images.dzcdn.net/images/cover/de5852bd5264d4b5707a2b6bb186a2c6/0x1900-000000-80-0-0.jpg"
          alt="User Avatar"
        />

        <span className="mdi mdi-chevron-down text-white fs-4"></span>

      </div>
    </header>
  );
};

export default Header;
