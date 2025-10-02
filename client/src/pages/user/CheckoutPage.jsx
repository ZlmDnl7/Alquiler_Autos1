import { useDispatch, useSelector } from "react-redux";
import { MdVerifiedUser } from "react-icons/md";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaIndianRupeeSign } from "react-icons/fa6";

import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setPageLoading } from "../../redux/user/userSlice";
import { setisPaymentDone } from "../../redux/user/LatestBookingsSlice";
import {toast, Toaster} from "sonner";

export async function sendBookingDetailsEmail(
  toEmail,
  bookingDetails,
  dispatch
) {
  try {
    const sendEamil = await fetch("/api/user/sendBookingDetailsEamil", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toEmail, data: bookingDetails }),
    });
    const response = await sendEamil.json();

    if (!response.ok) {
      dispatch(setisPaymentDone(false));
      console.log("something went wrong while sending email");
      return;
    }

    return "good";
  } catch (error) {
    console.log(error);
  }
}

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "email required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Invalid email address",
    }),
});

// Helper function to calculate days and price
const calculateDaysAndPrice = (pickupDateTime, dropoffDateTime, price) => {
  if (pickupDateTime && dropoffDateTime) {
    const start = new Date(pickupDateTime);
    const end = new Date(dropoffDateTime);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days: diffDays, totalPrice: price * diffDays + 25 };
  }
  return { days: 0, totalPrice: 0 };
};

// Helper function to validate form data
const validateFormData = (data) => {
  const { localPickupDateTime, localDropoffDateTime, localPickupDistrict, 
          localPickupLocation, localDropoffDistrict, localDropoffLocation } = data;
  
  return !localPickupDateTime || !localDropoffDateTime || !localPickupDistrict || 
         !localPickupLocation || !localDropoffDistrict || !localDropoffLocation;
};

// Helper function for fuel type display
const getFuelTypeDisplay = (fuelType) => {
  const fuelTypeMap = {
    'petrol': 'Gasolina',
    'diesel': 'Diésel',
    'electirc': 'Eléctrico',
    'hybrid': 'Híbrido'
  };
  return fuelTypeMap[fuelType] || fuelType;
};

// Helper function for transmission display
const getTransmissionDisplay = (transmission) => {
  const transmissionMap = {
    'manual': 'Manual',
    'automatic': 'Automática'
  };
  return transmissionMap[transmission] || transmission;
};

const CheckoutPage = () => {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();

  const {
    pickup_district,
    pickup_location,
    dropoff_location,
    pickupDate,
    dropoffDate,
  } = useSelector((state) => state.bookingDataSlice);

  //latest bookings data taken from redux
  const { data, paymentDone } = useSelector(
    (state) => state.latestBookingsSlice
  );

  const currentUser = useSelector((state) => state.user.currentUser);
  const singleVehicleDetail = useSelector(
    (state) => state.userListVehicles.singleVehicleDetail
  );
  const { isPageLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const { email, phoneNumber } = currentUser;
  const { price } = singleVehicleDetail;

  const user_id = currentUser._id;
  const vehicle_id = singleVehicleDetail._id;

  const start = pickupDate?.humanReadable
    ? new Date(pickupDate?.humanReadable)
    : new Date();
  const end = pickupDate?.humanReadable
    ? new Date(dropoffDate?.humanReadable)
    : new Date();

  const diffMilliseconds = end - start;
  const Days = Math.round(diffMilliseconds / (1000 * 3600 * 24));

  // Estado local para los campos del formulario de reserva
  const [localPickupDistrict, setLocalPickupDistrict] = useState(pickup_district || "");
  const [localPickupLocation, setLocalPickupLocation] = useState(pickup_location || "");
  const [localDropoffDistrict, setLocalDropoffDistrict] = useState(pickup_district || "");
  const [localDropoffLocation, setLocalDropoffLocation] = useState(dropoff_location || "");
  const [localPickupDateTime, setLocalPickupDateTime] = useState("");
  const [localDropoffDateTime, setLocalDropoffDateTime] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationData, setReservationData] = useState(null);

  // Función para actualizar el estado de Redux cuando cambien los campos
  const updateBookingData = (field, value) => {
    // Aquí deberías dispatchar la acción para actualizar Redux
    console.log(`Actualizando ${field}:`, value);
  };

  const { days: calculatedDays, totalPrice: calculatedTotalPrice } = calculateDaysAndPrice(
    localPickupDateTime, 
    localDropoffDateTime, 
    price
  );

  //calculateing total price
  let totalPrice = price * Days + 25;
  // Helper function to create order data
  const createOrderData = () => ({
    user_id,
    vehicle_id,
    totalPrice: calculatedTotalPrice > 0 ? calculatedTotalPrice : totalPrice,
    pickupDate: localPickupDateTime,
    dropoffDate: localDropoffDateTime,
    pickup_district: localPickupDistrict,
    pickup_location: localPickupLocation,
    dropoff_district: localDropoffDistrict,
    dropoff_location: localDropoffLocation,
  });

  // Helper function to save booking
  const saveBooking = async (orderData) => {
    const response = await fetch("/api/user/bookCar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    return { response, result };
  };

  //handle place order data
  const handlePlaceOrder = async () => {
    const formData = {
      localPickupDateTime,
      localDropoffDateTime,
      localPickupDistrict,
      localPickupLocation,
      localDropoffDistrict,
      localDropoffLocation
    };

    // Validar que todos los campos estén llenos
    if (validateFormData(formData)) {
      toast.error("Por favor completa todos los campos de ubicación y fechas");
      return;
    }

    const orderData = createOrderData();
    console.log("Datos de la orden:", orderData);

    try {
      dispatch(setPageLoading(true));
      
      console.log("Intentando guardar reserva directamente...");
      
      const { response, result } = await saveBooking(orderData);
      console.log("Respuesta del backend:", result);

      if (response.ok && result) {
        toast.success("¡Reserva creada exitosamente!");
        setReservationSuccess(true);
        setReservationData(result.booked);
      } else {
        toast.error(result?.message || "Error al crear la reserva");
      }
    } catch (error) {
      console.log("Error en handlePlaceOrder:", error);
      toast.error("Error al procesar la reserva: " + error.message);
    } finally {
      dispatch(setPageLoading(false));
    }
  };

  //after payment is done in displayRazorpay function we update the paymentDone from false to true our useEffect is triggered whenever state of paymentDone or data changes
  // 5.call our sendBookingDetails function to call my sendEmailapi with recivers email and his last bookingsData
  useEffect(() => {
    if (paymentDone && data) {
      const sendEmail = async () => {
        await sendBookingDetailsEmail(email, data, dispatch);
        dispatch(setisPaymentDone(false));
      };

      sendEmail();
    }
  }, [paymentDone, data, email, dispatch]);

  // Limpiar estado de carga cuando el componente se desmonte
  useEffect(() => {
    return () => {
      dispatch(setPageLoading(false));
    };
  }, [dispatch]);

  // Mostrar pantalla de confirmación si la reserva fue exitosa
  if (reservationSuccess && reservationData) {
    return (
      <>
        <Toaster
          toastOptions={{
            classNames: {
              error: "bg-red-500 p-5",
              success: "text-green-400 p-5",
              warning: "text-yellow-400 p-5",
              info: "bg-blue-400 p-5",
            },
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
            {/* Icono de éxito */}
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            
            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              ¡Reserva Confirmada!
            </h1>
            
            {/* Mensaje */}
            <p className="text-gray-600 text-lg mb-8">
              Tu auto ha sido reservado exitosamente. Revisa los detalles a continuación.
            </p>
            
            {/* Detalles de la reserva */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span>
                Detalles de la Reserva
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID de Reserva:</p>
                  <p className="font-semibold text-gray-800">{reservationData._id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Precio Total:</p>
                  <p className="font-semibold text-green-600">₹ {reservationData.totalPrice}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Fecha de Recogida:</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(reservationData.pickupDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Fecha de Devolución:</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(reservationData.dropOffDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Lugar de Recogida:</p>
                  <p className="font-semibold text-gray-800">{reservationData.pickUpLocation}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Lugar de Devolución:</p>
                  <p className="font-semibold text-gray-800">{reservationData.dropOffLocation}</p>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span>🏠</span> Ir al Inicio
              </button>
              
              <button
                onClick={() => {
                  setReservationSuccess(false);
                  setReservationData(null);
                }}
                className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span>🔄</span> Hacer Otra Reserva
              </button>
            </div>
            
            {/* Información adicional */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Nota:</span> Recibirás un email de confirmación con todos los detalles de tu reserva.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster
        toastOptions={{
          classNames: {
            error: "bg-red-500 p-5",
            success: "text-green-400 p-5",
            warning: "text-yellow-400 p-5",
            info: "bg-blue-400 p-5",
          },
        }}
      />
      <div className="grid w-full absolute top-0  sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-[120px] xl:pl-[100px] gap-10 xl:mt-20 ">
        {/* Botón de regreso */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            ← Volver
          </button>
        </div>
                    <div className="px-6 bg-gradient-to-br from-gray-50 to-white w-full h-full rounded-2xl shadow-lg">
              <div
                className="pt-8 space-y-6 rounded-2xl border border-gray-100 shadow-xl px-6 py-6 sm:px-8 md:min-h-[600px] bg-white backdrop-blur-sm flex flex-col justify-between"
              >
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">🚗 Resumen del Pedido</h1>
                  <p className="text-gray-600 text-lg">
                    Revisa los detalles de tu reserva y completa el pago
                  </p>
                </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="relative">
                  <img
                    className="h-32 w-40 rounded-xl border-2 border-blue-200 object-cover shadow-lg"
                src={singleVehicleDetail.image[0]}
                    alt={singleVehicleDetail.name || singleVehicleDetail.model}
                  />
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    ⭐ Premium
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {singleVehicleDetail.name || singleVehicleDetail.model}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Paquete</p>
                      <p className="font-semibold text-gray-800">{singleVehicleDetail.base_package}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Combustible</p>
                      <p className="font-semibold text-gray-800">
                        {getFuelTypeDisplay(singleVehicleDetail.fuel_type)}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Transmisión</p>
                      <p className="font-semibold text-gray-800">
                        {getTransmissionDisplay(singleVehicleDetail.transmition)}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Registro</p>
                      <p className="font-semibold text-gray-800">{singleVehicleDetail.registeration_number}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 text-center">
                    <p className="text-sm opacity-90">Precio por día</p>
                    <p className="text-3xl font-bold">₹ {singleVehicleDetail.price}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className=" cursor-pointer  rounded-lg drop-shadow-sm  border border-slate-50  p-4 mt-40 pt-10">
              {/* Formulario de reserva */}
              <div className="mb-8 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 shadow-lg w-full">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
                    <span className="text-2xl">📍</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Configurar Ubicaciones y Fechas
                  </h3>
                  <p className="text-gray-600">
                    Define dónde y cuándo quieres tu auto
                  </p>
                </div>
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">💡</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-2">
                        Diferencia importante:
                      </p>
                      <ul className="text-xs text-amber-700 space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                          <strong>📍 Puntos de Recogida/Devolución:</strong> Dónde quieres que te entreguen y recojan el auto
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                          <strong>📱 Datos de Contacto:</strong> Tu email y teléfono para confirmar la reserva
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                                  <div className="grid md:grid-cols-1 gap-8">
                  {/* Recogida */}
                  <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🚗</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Recogida</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="pickup-district" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Ciudad de Recogida *
                        </label>
                        <input
                          id="pickup-district"
                          type="text"
                          placeholder="Ej: Medellín, Bogotá, Nueva York..."
                          className="w-full px-8 py-5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white text-lg"
                          value={localPickupDistrict}
                          onChange={(e) => {
                            setLocalPickupDistrict(e.target.value);
                            updateBookingData('pickup_district', e.target.value);
                          }}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="pickup-location" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          📍 Punto de Recogida *
                        </label>
                        <input
                          id="pickup-location"
                          type="text"
                          placeholder="Ej: Centro Comercial Santa Ana, Aeropuerto..."
                          className="w-full px-8 py-5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white text-lg"
                          value={localPickupLocation}
                          onChange={(e) => {
                            setLocalPickupLocation(e.target.value);
                            updateBookingData('pickup_location', e.target.value);
                          }}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="pickup-datetime" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          📅 Fecha y Hora de Recogida *
                        </label>
                        <input
                          id="pickup-datetime"
                          type="datetime-local"
                          className="w-full px-8 py-5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white text-lg"
                          value={localPickupDateTime}
                          min={new Date().toISOString().slice(0, 16)}
                          onChange={(e) => {
                            setLocalPickupDateTime(e.target.value);
                            updateBookingData('pickupDateTime', e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Devolución */}
                  <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🔄</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">Devolución</h4>
                </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="dropoff-district" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Ciudad de Devolución *
                        </label>
                        <input
                          id="dropoff-district"
                          type="text"
                          placeholder="Ej: Medellín, Bogotá, Nueva York..."
                          className="w-full px-8 py-5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-lg"
                          value={localDropoffDistrict}
                          onChange={(e) => {
                            setLocalDropoffDistrict(e.target.value);
                            updateBookingData('dropoff_district', e.target.value);
                          }}
                        />
                  </div>

                      <div>
                        <label htmlFor="dropoff-location" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          📍 Punto de Devolución *
                        </label>
                        <input
                          id="dropoff-location"
                          type="text"
                          placeholder="Ej: Hotel Hilton, Estación Central..."
                          className="w-full px-8 py-5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-lg"
                          value={localDropoffLocation}
                          onChange={(e) => {
                            setLocalDropoffLocation(e.target.value);
                            updateBookingData('dropoff_location', e.target.value);
                          }}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="dropoff-datetime" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          📅 Fecha y Hora de Devolución *
                        </label>
                        <input
                          id="dropoff-datetime"
                          type="datetime-local"
                          className="w-full px-8 py-5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-lg"
                          value={localDropoffDateTime}
                          min={localPickupDateTime || new Date().toISOString().slice(0, 16)}
                          onChange={(e) => {
                            setLocalDropoffDateTime(e.target.value);
                            updateBookingData('dropoffDateTime', e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div className=" rounded-lg flex justify-center items-center gap-2 text-[8px] drop-shadow-md  border border-sm  p-4">
                <div>
                  <MdVerifiedUser
                    style={{ fontSize: 50, color: "green", fill: "green" }}
                  />
                </div>
                <div>
                  <p>Cargos por tiempo de inactividad: según la política</p>
                  <p>
                    Exención de cargos excesivos de la póliza por abolladuras y pintura,
                    excluyendo reparaciones por accidentes mayores
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* details */}
        <div className="mt-10 bg-gradient-to-br from-gray-50 to-white px-6 pt-8 lg:mt-0 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">💳 Detalles de Pago</h2>
            <p className="text-gray-600 text-lg">
              Completa tu orden proporcionando tus datos de contacto
            </p>
          </div>

          <form onSubmit={handleSubmit(handlePlaceOrder)}>
            <div className="flex flex-col gap-y-6 my-6">
              {/* Header de contacto */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full mb-4 shadow-lg">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Confirmar Email
                </h3>
                <p className="text-gray-600 text-base">
                  Verifica que tu email esté correcto para recibir la confirmación
                </p>
              </div>

              {/* email */}
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <TextField
                  id="email"
                  label="Correo Electrónico"
                  variant="outlined"
                  size="medium"
                  className="w-full"
                  defaultValue={email || ""}
                  {...register("email")}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <span>⚠️</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Información del usuario */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Información del Usuario</h4>
              </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-800">{email || "No configurado"}</span>
              </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    <span className="font-semibold text-gray-800">
                      {phoneNumber || "No configurado"}
                    </span>
                    </div>
                </div>
                
                {!phoneNumber && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>
                        <strong>Recomendación:</strong> Configura tu teléfono en tu perfil para recibir confirmaciones importantes.
                      </span>
                    </p>
                  </div>
                )}
              </div>




            </div>

            {/* Total */}
            <div className="mt-6 border-t border-b py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Alquiler</p>
                <p className="font-semibold text-gray-900">{price}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Días</p>
                <p className="font-semibold text-gray-900">
                  {calculatedDays > 0 ? calculatedDays : Days}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Envío</p>
                <p className="font-semibold text-gray-900">25.00</p>
              </div>

            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Total</p>
              <p className="text-2xl font-semibold text-gray-900 flex items-center justify-center">
                <span>
                  <FaIndianRupeeSign />{" "}
                </span>
                {calculatedTotalPrice > 0 ? calculatedTotalPrice : totalPrice}
              </p>
            </div>

            {isPageLoading ? (
              <div className="space-y-3">
              <button
                  type="button"
                  className="w-full rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 px-8 py-4 font-bold text-white text-lg shadow-lg transform scale-95 cursor-not-allowed"
                disabled
              >
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Procesando Pago...</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(setPageLoading(false))}
                  className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-8 py-3 font-bold text-white text-base shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>❌</span>
                    <span>Cancelar</span>
                  </div>
              </button>
              </div>
            ) : (
              <button
                type="submit"
                className="mt-6 mb-8 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-8 py-4 font-bold text-white text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-3">
                  <span>💳</span>
                  <span>Realizar Pedido</span>
                  <span>💳</span>
                </div>
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
