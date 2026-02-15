import Header from "../components/header";
import Sidebar from "../components/sideBar";
import '../styelesGlobal.css'

const PrivateLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div className="container-fluid h-100">
        <div className="row h-100">
          <Sidebar />
          {children}
        </div>
      </div>
    </>
  );
};

export default PrivateLayout;