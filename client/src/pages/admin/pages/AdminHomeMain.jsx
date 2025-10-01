

import { useState, useEffect } from "react";
import { LineChart, Button } from "../components";
import { toast } from "sonner";

const AdminHomeMain = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalAdmins: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/admin/getDashboardStats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        toast.error("Error al cargar estadísticas");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 ">
      {/* hero - productsIncome */}
      <div className="flex flex-wrap lg:flex-nowrap justify-center items-center lg:items-start">
        <div className=" dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 xl:w-full 2xl:w-80 p-8 pt-9 m-3  bg-hero-pattern bg-no-repeat bg-cover   bg-slate-50 xl:h-[250px] 2xl:h-44">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-400">Usuarios Totales</p>
              <p className="text-2xl text-black">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="mt-6">
            <Button
              color="white"
              bgColor="blue"
              text="Descargar"
              borderRadius="10px"
              size="md"
            />
          </div>
        </div>

        <div className="flex m-3 flex-wrap  justify-center xl:justify-start  gap-1 items-center ">
          <div className="bg-slate-50 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt9 rounded-2xl 2xl:h-44">
            <button
              type="button"
              style={{ color: "#03C9D7", backgroundColor: "#E5FAFB" }}
              className="text-2xl opacity-0.9 "
            >
              👥
            </button>
            <p className="mt-3">
              <span className="text-lg font-semibold text-black">
                {stats.totalUsers}
              </span>
            </p>
            <p className="text-sm text-gray-400 mt-1">Clientes</p>
          </div>

          <div className="bg-slate-50 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt9 rounded-2xl 2xl:h-44">
            <button
              type="button"
              style={{ color: "rgb(255, 244, 229)", backgroundColor: "rgb(254, 201, 15)" }}
              className="text-2xl opacity-0.9 "
            >
              🏪
            </button>
            <p className="mt-3">
              <span className="text-lg font-semibold text-black">
                {stats.totalVendors}
              </span>
            </p>
            <p className="text-sm text-gray-400 mt-1">Vendedores</p>
          </div>

          <div className="bg-slate-50 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt9 rounded-2xl 2xl:h-44">
            <button
              type="button"
              style={{ color: "rgb(228, 106, 118)", backgroundColor: "rgb(255, 244, 229)" }}
              className="text-2xl opacity-0.9 "
            >
              👑
            </button>
            <p className="mt-3">
              <span className="text-lg font-semibold text-black">
                {stats.totalAdmins}
              </span>
            </p>
            <p className="text-sm text-gray-400 mt-1">Administradores</p>
          </div>
        </div>
      </div>

      {/* graphs */}
      <div className="flex gap-10 m-4 flex-wrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xl font-semibold">Usuarios Recientes</p>
          </div>
          <div className="mt-10 w-72 md:w-400">
            {stats.recentUsers.length > 0 ? (
              <div className="space-y-3">
                {stats.recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <img
                      src={user.profilePicture || "https://via.placeholder.com/40"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No hay usuarios recientes</p>
            )}
          </div>
          <div className="flex justify-between items-center mt-5 border-t-1 border-color">
            <div className="mt-3">
              <Button
                color="white"
                text="Ver Todos"
                borderRadius="10px"
              />
            </div>
            <p className="text-gray-400 text-sm">{stats.recentUsers.length} Usuarios Recientes</p>
          </div>
        </div>
        
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-96 md:w-760">
          <div className="flex justify-between items-center gap-2 mb-10">
            <p className="text-xl font-semibold">Resumen del Sistema</p>
          </div>
          <div className="md:w-full overflow-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600">Total Clientes</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.totalVendors}</p>
                <p className="text-sm text-gray-600">Total Vendedores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeMain;
