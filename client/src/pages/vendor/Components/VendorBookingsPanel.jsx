import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FiCalendar, FiClock, FiMapPin, FiUser, FiCar, FiDollarSign } from "react-icons/fi";

export default function VendorBookingsPanel() {
  const { _id } = useSelector((state) => state.user.currentUser);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("🔍 VendorBookingsPanel renderizado");
  console.log("🏪 Vendor ID:", _id);

  const fetchVendorBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Iniciando fetchVendorBookings...");
      
      if (!_id) {
        console.log("❌ No hay vendor ID");
        setError("Vendedor no autenticado");
        setLoading(false);
        return;
      }
      
      const res = await fetch("/api/user/findBookingsForVendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorId: _id,
        }),
      });

      console.log("📡 Respuesta del servidor:", res);
      console.log("📊 Status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("📦 Datos recibidos:", data);
      console.log("📏 Cantidad de reservas:", data?.length);

      if (data && Array.isArray(data)) {
        setBookings(data);
        console.log("✅ Estado actualizado con reservas");
      } else {
        console.log("❌ Datos no válidos:", data);
        setBookings([]);
      }
    } catch (error) {
      console.log("💥 Error en fetchVendorBookings:", error);
      setError(error.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorBookings();
  }, [_id]);

  // Función para traducir estados (incluye estados antiguos en inglés)
  const getStatusText = (status) => {
    const statusMap = {
      // Estados nuevos en español
      "noReservado": "No Reservado",
      "reservado": "Reservado",
      "enViaje": "En Viaje",
      "noRecogido": "No Recogido",
      "cancelado": "Cancelado",
      "vencido": "Vencido",
      "viajeCompletado": "Viaje Completado",
      // Estados antiguos en inglés (para compatibilidad)
      "notBooked": "No Reservado",
      "booked": "Reservado",
      "onTrip": "En Viaje",
      "notPicked": "No Recogido",
      "canceled": "Cancelado",
      "overDue": "Vencido",
      "tripCompleted": "Viaje Completado"
    };
    return statusMap[status] || status;
  };

  // Función para obtener color del estado (incluye estados antiguos en inglés)
  const getStatusColor = (status) => {
    const colorMap = {
      // Estados nuevos en español
      "noReservado": "bg-gray-100 text-gray-800",
      "reservado": "bg-blue-100 text-blue-800",
      "enViaje": "bg-green-100 text-green-800",
      "noRecogido": "bg-yellow-100 text-yellow-800",
      "cancelado": "bg-red-100 text-red-800",
      "vencido": "bg-orange-100 text-orange-800",
      "viajeCompletado": "bg-purple-100 text-purple-800",
      // Estados antiguos en inglés (para compatibilidad)
      "notBooked": "bg-gray-100 text-gray-800",
      "booked": "bg-blue-100 text-blue-800",
      "onTrip": "bg-green-100 text-green-800",
      "notPicked": "bg-yellow-100 text-yellow-800",
      "canceled": "bg-red-100 text-red-800",
      "overDue": "bg-orange-100 text-orange-800",
      "tripCompleted": "bg-purple-100 text-purple-800"
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg">
          <span className="text-3xl">📋</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Reservas de Mis Autos</h1>
        <p className="text-lg text-gray-600">
          {bookings && bookings.length > 0
            ? `Tienes ${bookings.length} reserva${bookings.length > 1 ? 's' : ''} activa${bookings.length > 1 ? 's' : ''}`
            : "Aún no hay reservas para tus autos"
          }
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-green-600"></div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Cargando reservas...</h3>
          <p className="text-gray-500">Buscando en la base de datos</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-semibold text-red-700 mb-4">Error al cargar reservas</h3>
          <p className="text-red-500 mb-8">{error}</p>
          <button
            onClick={fetchVendorBookings}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            🔄 Intentar de nuevo
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!bookings || bookings.length === 0) && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">🚗</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">No hay reservas aún</h3>
          <p className="text-gray-500 mb-8">Cuando los usuarios reserven tus autos, aparecerán aquí</p>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 max-w-md mx-auto border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">💡 Consejo</h4>
            <p className="text-sm text-green-700">
              Asegúrate de que tus autos estén bien descritos y con buenas fotos para atraer más reservas.
            </p>
          </div>
        </div>
      )}

      {/* Lista de Reservas */}
      <div className="space-y-6">
        {bookings && bookings.length > 0 && bookings.map((booking, idx) => {
          const pickupDate = new Date(booking.bookingDetails.pickupDate);
          const dropoffDate = new Date(booking.bookingDetails.dropOffDate);

          return (
            <div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              key={idx}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Imagen del Auto */}
                <div className="lg:col-span-1">
                  <div className="relative h-64 lg:h-full">
                    <img
                      alt={booking.vehicleDetails?.name || "Vehículo"}
                      className="w-full h-full object-cover"
                      src={booking.vehicleDetails?.image?.[0] || "/placeholder-car.jpg"}
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.bookingDetails.status)}`}>
                      {getStatusText(booking.bookingDetails.status)}
                    </div>
                  </div>
                </div>

                {/* Detalles de la Reserva */}
                <div className="lg:col-span-2 p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {booking.vehicleDetails?.name || "Vehículo"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Cliente: {booking.userDetails?.username || "Usuario"}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {booking.bookingDetails._id?.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                        <FiDollarSign />
                        {booking.bookingDetails.totalPrice}
                      </p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>

                  {/* Fechas y Ubicaciones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Recogida */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🚗</span>
                        </div>
                        <h4 className="font-semibold text-blue-800">Recogida</h4>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <FiMapPin className="text-blue-500" />
                          <span className="font-medium">{booking.bookingDetails.pickUpLocation}</span>
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="text-blue-500" />
                          <span>{pickupDate.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiClock className="text-blue-500" />
                          <span>{pickupDate.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Devolución */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🔄</span>
                        </div>
                        <h4 className="font-semibold text-green-800">Devolución</h4>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <FiMapPin className="text-green-500" />
                          <span className="font-medium">{booking.bookingDetails.dropOffLocation}</span>
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="text-green-500" />
                          <span>{dropoffDate.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiClock className="text-green-500" />
                          <span>{dropoffDate.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del Cliente */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <FiUser className="text-white text-sm" />
                      </div>
                      <h4 className="font-semibold text-gray-800">Información del Cliente</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="font-semibold text-gray-800">{booking.userDetails?.username || "No disponible"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold text-gray-800">{booking.userDetails?.email || "No disponible"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-3">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
                      <span>📞</span>
                      Contactar Cliente
                    </button>
                    
                    <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
                      <span>✅</span>
                      Confirmar Recogida
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
