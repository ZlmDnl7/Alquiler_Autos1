import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { IoMdTime } from "react-icons/io";
import { CiCalendarDate } from "react-icons/ci";
import { CiLocationOn } from "react-icons/ci";
import UserOrderDetailsModal from "../../components/UserOrderDetailsModal";
import {
  setIsOrderModalOpen,
  setSingleOrderDetails,
} from "../../redux/user/userSlice";

export default function Orders() {
  const { _id } = useSelector((state) => state.user.currentUser);
  const [bookings, setBookings] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  console.log("🔍 Orders component renderizado");
  console.log("👤 Current user:", useSelector((state) => state.user.currentUser));
  console.log("🆔 User ID:", _id);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Iniciando fetchBookings...");
      console.log("👤 User ID:", _id);
      
      if (!_id) {
        console.log("❌ No hay user ID");
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }
      
      const res = await fetch("/api/user/findBookingsOfUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: _id,
        }),
      });

      console.log("📡 Respuesta del servidor:", res);
      console.log("📊 Status:", res.status);
      console.log("📋 OK:", res.ok);

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
      console.log("💥 Error en fetchBookings:", error);
      setError(error.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDetailsModal = (bookingDetails, vehicleDetails) => {
    dispatch(setIsOrderModalOpen(true));
    dispatch(setSingleOrderDetails(bookingDetails, vehicleDetails));
  };

  return (
    <div className="max-w-6xl mx-auto py-20 px-4">
      <UserOrderDetailsModal />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
          <span className="text-3xl">🚗</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Mis Reservas</h1>
        <p className="text-lg text-gray-600">
          {bookings && bookings.length > 0 
            ? `Tienes ${bookings.length} reserva${bookings.length > 1 ? 's' : ''} activa${bookings.length > 1 ? 's' : ''}`
            : "Aún no has hecho ninguna reserva"
          }
        </p>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Cargando reservas...</h3>
          <p className="text-gray-500">Buscando en la base de datos</p>
        </div>
      )}

      {/* Estado de error */}
      {error && !loading && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-semibold text-red-700 mb-4">Error al cargar reservas</h3>
          <p className="text-red-500 mb-8">{error}</p>
          <button 
            onClick={fetchBookings}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            🔄 Intentar de nuevo
          </button>
        </div>
      )}

      {/* Estado vacío */}
      {!loading && !error && (!bookings || bookings.length === 0) && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">📋</span>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">No hay reservas aún</h3>
          <p className="text-gray-500 mb-8">Cuando hagas tu primera reserva, aparecerá aquí</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            🚗 Explorar Autos
          </button>
        </div>
      )}

      {/* Lista de reservas */}
      <div className="space-y-6">
        {bookings && bookings.length > 0 && bookings.map((cur, idx) => {
          const pickupDate = new Date(cur.bookingDetails.pickupDate);
          const dropoffDate = new Date(cur.bookingDetails.dropOffDate);

          return (
            <div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              key={idx}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Imagen del vehículo */}
                <div className="lg:col-span-1">
                  <div className="relative h-64 lg:h-full">
                    <img
                      alt={cur.vehicleDetails?.name || "Vehículo"}
                      className="w-full h-full object-cover"
                      src={cur.vehicleDetails?.image?.[0] || "/placeholder-car.jpg"}
                    />
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Confirmada
                    </div>
                  </div>
                </div>
                
                {/* Detalles de la reserva */}
                <div className="lg:col-span-2 p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {cur.vehicleDetails?.name || "Vehículo"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {cur.bookingDetails._id?.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                        <span>₹</span>
                        {cur.bookingDetails.totalPrice}
                      </p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                  
                  {/* Fechas y ubicaciones */}
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
                          <CiLocationOn className="text-blue-500" />
                          <span className="font-medium">{cur.bookingDetails.pickUpLocation}</span>
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CiCalendarDate className="text-blue-500" />
                          <span>{pickupDate.toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <IoMdTime className="text-blue-500" />
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
                          <CiLocationOn className="text-green-500" />
                          <span className="font-medium">{cur.bookingDetails.dropOffLocation}</span>
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CiCalendarDate className="text-green-500" />
                          <span>{dropoffDate.toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <IoMdTime className="text-green-500" />
                          <span>{dropoffDate.toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botón de detalles */}
                  <div className="flex justify-end">
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                      onClick={() => handleDetailsModal(cur)}
                    >
                      <span>👁️</span>
                      Ver Detalles
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
