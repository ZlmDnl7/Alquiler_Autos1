import React, { useState, useEffect } from 'react';
import { FiTruck, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const VendorHomeMain = () => {
  const [vendorStats, setVendorStats] = useState({
    totalVehicles: 0,
    approvedVehicles: 0,
    pendingVehicles: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { _id } = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        
        // Obtener vehículos del vendedor
        const vehiclesRes = await fetch("/api/vendor/showVendorVehilces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id })
        });
        
        let vehicles = [];
        if (vehiclesRes.ok) {
          vehicles = await vehiclesRes.json();
        }

        // Obtener reservas del vendedor
        const bookingsRes = await fetch("/api/vendor/showVendorBookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id })
        });
        
        let bookings = [];
        if (bookingsRes.ok) {
          bookings = await bookingsRes.json();
        }

        // Calcular estadísticas reales
        const totalVehicles = vehicles.length;
        const approvedVehicles = vehicles.filter(v => v.isAdminApproved === true).length;
        const pendingVehicles = vehicles.filter(v => v.isAdminApproved === false).length;
        
        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        
        // Calcular ganancias (suma de reservas completadas)
        const totalEarnings = bookings
          .filter(b => b.status === 'completed' && b.payment_status === 'completed')
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);

        setVendorStats({
          totalVehicles,
          approvedVehicles,
          pendingVehicles,
          totalBookings,
          pendingBookings,
          completedBookings,
          totalEarnings
        });

        // Mostrar reservas recientes (últimas 5)
        const recentBookingsData = bookings
          .slice(0, 5)
          .map(booking => ({
            id: booking._id,
            customer: booking.user_name || 'Cliente',
            vehicle: booking.vehicle_name || 'Vehículo',
            date: new Date(booking.pickup_date).toLocaleDateString('es-ES'),
            status: booking.status === 'pending' ? 'Pendiente' : 
                    booking.status === 'approved' ? 'Aprobada' : 
                    booking.status === 'completed' ? 'Completada' : 'Pendiente'
          }));

        setRecentBookings(recentBookingsData);
        
      } catch (error) {
        console.error('Error cargando datos del vendedor:', error);
      } finally {
        setLoading(false);
      }
    };

    if (_id) {
      fetchVendorData();
    }
  }, [_id]);

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos del vendedor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Vendedor</h1>
          <p className="text-gray-600">Gestiona tus vehículos y reservas</p>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total de Vehículos */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total de Vehículos</p>
              <p className="text-3xl font-bold">{vendorStats.totalVehicles}</p>
            </div>
            <FiTruck className="text-4xl opacity-80" />
          </div>
        </div>

        {/* Vehículos Aprobados */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Vehículos Aprobados</p>
              <p className="text-3xl font-bold">{vendorStats.approvedVehicles}</p>
            </div>
            <FiTruck className="text-4xl opacity-80" />
          </div>
        </div>

        {/* Reservas Pendientes */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Reservas Pendientes</p>
              <p className="text-3xl font-bold">{vendorStats.pendingBookings}</p>
            </div>
            <FiCalendar className="text-4xl opacity-80" />
          </div>
        </div>

        {/* Ganancias Totales */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Ganancias Totales</p>
              <p className="text-3xl font-bold">€{vendorStats.totalEarnings}</p>
            </div>
            <FiDollarSign className="text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Información de Vehículos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Estado de Vehículos */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Estado de Vehículos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Vehículos</span>
              <span className="font-semibold">{vendorStats.totalVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Aprobados</span>
              <span className="text-green-600 font-semibold">{vendorStats.approvedVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendientes de Aprobación</span>
              <span className="text-yellow-600 font-semibold">{vendorStats.pendingVehicles}</span>
            </div>
          </div>
        </div>

        {/* Resumen de Reservas */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen de Reservas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Reservas</span>
              <span className="font-semibold">{vendorStats.totalBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendientes</span>
              <span className="text-yellow-600 font-semibold">{vendorStats.pendingBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completadas</span>
              <span className="text-green-600 font-semibold">{vendorStats.completedBookings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reservas Recientes */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Reservas Recientes</h3>
        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📅</div>
            <p className="text-gray-500">No hay reservas aún</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Vehículo</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{booking.customer}</td>
                      <td className="py-3 px-4">{booking.vehicle}</td>
                      <td className="py-3 px-4">{booking.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'Aprobada' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-sm mt-4">{recentBookings.length} Reservas Recientes</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorHomeMain;
