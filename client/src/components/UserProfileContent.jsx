import { useDispatch, useSelector } from "react-redux";
import ProfileEdit from "../pages/user/ProfileEdit";
import toast, { Toaster } from "react-hot-toast";
import { setUpdated } from "../redux/user/userSlice";
import { useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3 } from "react-icons/fi";

const UserProfileContent = () => {
  const { email, username, profilePicture, phoneNumber, adress } = useSelector(
    (state) => state.user.currentUser
  );
  const dispatch = useDispatch();
  const isUpdated = useSelector((state) => state.user.isUpdated);
  
  useEffect(() => {
    if (isUpdated) {
      toast.success("¡Perfil actualizado exitosamente!");
      dispatch(setUpdated(false));
    }
  }, [isUpdated, dispatch]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Toaster />
      
      {/* Header Principal */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
          <span className="text-3xl">👤</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Mi Perfil</h1>
        <p className="text-lg text-gray-600">Gestiona tu información personal y preferencias</p>
      </div>

      {/* Tarjeta Principal del Perfil */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Banner Superior */}
        <div className="h-48 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* Información del Perfil */}
        <div className="px-8 py-6 relative">
          {/* Avatar */}
          <div className="absolute -top-20 left-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-6 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiUser className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Botón de Editar */}
              <div className="absolute bottom-2 right-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer">
                  <ProfileEdit />
                </div>
              </div>
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="ml-48 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{username || "Usuario"}</h2>
            <p className="text-lg text-gray-600 mb-4">{email || "email@ejemplo.com"}</p>
            
            {/* Badge de Estado */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Cuenta Activa
            </div>
          </div>

          {/* Sección de Información Detallada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información Personal */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Información Personal</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100">
                  <FiMail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800">{email || "No configurado"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100">
                  <FiPhone className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-semibold text-gray-800">
                      {phoneNumber ? phoneNumber : "No configurado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Ubicación */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Ubicación</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-100">
                  <FiMapPin className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-semibold text-gray-800">
                      {adress ? adress : "No configurada"}
                    </p>
                  </div>
                </div>
                
                {!adress && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-700 flex items-center gap-2">
                      <span>💡</span>
                      <span>Configura tu dirección para recibir mejor servicio</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones del Perfil */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
                <FiEdit3 className="w-4 h-4" />
                Editar Perfil
              </button>
              
              <button className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
                <span>🔒</span>
                Cambiar Contraseña
              </button>
              
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
                <span>📱</span>
                Configurar Notificaciones
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas del Usuario */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚗</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">0</h3>
          <p className="text-gray-600">Reservas Activas</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⭐</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">0</h3>
          <p className="text-gray-600">Reservas Completadas</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">0</h3>
          <p className="text-gray-600">Autos Favoritos</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileContent;
