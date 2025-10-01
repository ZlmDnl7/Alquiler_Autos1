import { Routes, Route } from "react-router-dom";
import { Navbar, SideBar } from "../components/index.jsx";
import {
  AllVehicles,
  AllUsers,
  AllVendors,
  Calender,
  ColorPicker,
  Customers,
  Editor,
  VenderVehicleRequests,
} from "../pages";
import { useSelector } from "react-redux";
import AdminHomeMain from "../pages/AdminHomeMain.jsx";
import Bookings from "../components/Bookings.jsx";

function AdminDashNew() {
  const { activeMenu } = useSelector((state) => state.adminDashboardSlice);

  return (
    <div>
      <div className="flex relative dark:bg-main-dark-bg">
      
        {activeMenu ? (
          <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg">
            <SideBar />
          </div>
        ) : (
          <div className="w-0 dark:bg-secondary-dark-bg">
            <SideBar />
          </div>
        )}

        <div
          className={`dark:bg-white bg-white min-h-screen w-full ${
            activeMenu ? "ml-72 md:ml-72" : "flex-2"
          } `}
        >
          <div className={`fixed md:static bg-white  w-full   `}>
            <Navbar />
          </div>

          <div className="main_section mx-8  ">
            <Routes>
              <Route path="/" element={<AdminHomeMain/>}/>
              <Route path="/Inicio" element={<AdminHomeMain />} />
              <Route path="/Todos los Productos" element={<AllVehicles />} />
              <Route path="/Solicitudes de Vendedores" element={<VenderVehicleRequests />} />
              <Route path="/Pedidos" element={<Bookings />} />
              <Route path="/Empleados" element={<AllUsers />} />
              <Route path="/Clientes" element={<Customers />} />
              <Route path="/Calendario" element={<Calender />} />
              <Route path="/Tablero" element={<AllVendors />} />
              <Route path="/Editor" element={<Editor />} />
              <Route path="/Selector de Colores" element={<ColorPicker />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashNew;
