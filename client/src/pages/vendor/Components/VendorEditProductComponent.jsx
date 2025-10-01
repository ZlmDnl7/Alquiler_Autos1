import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { setVendorEditSuccess } from "../../../redux/vendor/vendorDashboardSlice";

export default function VendorEditProductComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { vendorVehilces } = useSelector((state) => state.vendorDashboardSlice);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicle_id = queryParams.get("vehicle_id");

  let updatingItem = "";
  vendorVehilces.forEach((cur) => {
    if (cur._id === vehicle_id) {
      updatingItem = cur;
    }
  });

  const onEditSubmit = async (data) => {
    try {
      if (data && vehicle_id) {
        const res = await fetch(
          `/api/vendor/vendorEditVehicles/${vehicle_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ formData: data }),
          }
        );

        if (res.ok) {
          toast.success("Vehículo actualizado correctamente");
          dispatch(setVendorEditSuccess(true));
          navigate("/vendorDashboard/vendorAllVeihcles");
        } else {
          toast.error("Error al actualizar el vehículo");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error de conexión");
    }
  };

  const handleClose = () => {
    navigate("/vendorDashboard/vendorAllVeihcles");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Editar Vehículo</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoMdClose size={24} />
            </button>
        </div>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-6">
            {/* Primera fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Registro *
                </label>
                <input
                  {...register("registeration_number", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.registeration_number || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC-1234"
                />
                {errors.registeration_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.registeration_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca *
                </label>
                <select
                  {...register("company", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.company || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar marca</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes">Mercedes</option>
                  <option value="Audi">Audi</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                </select>
                {errors.company && (
                  <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
                )}
              </div>
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo *
                </label>
                <input
                  {...register("name", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Corolla, Civic, Focus..."
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  {...register("title", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.car_title || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Toyota Corolla 2023 Luxury"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>
            </div>

            {/* Tercera fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paquete Base *
                </label>
                <select
                  {...register("base_package", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.base_package || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar paquete</option>
                  <option value="Básico">Básico</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Sport">Sport</option>
                </select>
                {errors.base_package && (
                  <p className="text-red-500 text-sm mt-1">{errors.base_package.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por Día *
                </label>
                <input
                  {...register("price", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.price || ""}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="35"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>
            </div>

            {/* Cuarta fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año de Fabricación *
                </label>
                <input
                  {...register("year_made", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.year_made || ""}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2021"
                />
                {errors.year_made && (
                  <p className="text-red-500 text-sm mt-1">{errors.year_made.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Combustible *
                </label>
                <select
                  {...register("fuel_type", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.fuel_type || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar combustible</option>
                  <option value="petrol">Gasolina</option>
                  <option value="diesel">Diésel</option>
                  <option value="electirc">Eléctrico</option>
                  <option value="hybrid">Híbrido</option>
                </select>
                {errors.fuel_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.fuel_type.message}</p>
                )}
              </div>
            </div>

            {/* Quinta fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Auto *
                </label>
                <select
                  {...register("car_type", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.car_type || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Sedán">Sedán</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Deportivo">Deportivo</option>
                  <option value="Furgoneta">Furgoneta</option>
                  <option value="Pickup">Pickup</option>
                </select>
                {errors.car_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.car_type.message}</p>
                )}
              </div>


            </div>

            {/* Sexta fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transmisión *
                </label>
                <select
                  {...register("transmition_type", { required: "Campo requerido" })}
                  defaultValue={updatingItem?.transmition || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar transmisión</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automática</option>
                </select>
                {errors.transmition_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.transmition_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                  </label>
                <textarea
                  {...register("description")}
                  defaultValue={updatingItem?.car_description || ""}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción del vehículo..."
                />
              </div>
                </div>

            {/* Ubicación y Distrito */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                  </label>
                  <input
                  {...register("location", { required: "Ubicación es requerida" })}
                  defaultValue={updatingItem?.location || ""}
                  type="text"
                  placeholder="Ej: Ciudad de México"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distrito/Zona *
                  </label>
                  <input
                  {...register("district", { required: "Distrito es requerido" })}
                  defaultValue={updatingItem?.district || ""}
                  type="text"
                  placeholder="Ej: Polanco, Condesa, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.district && (
                  <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>
                )}
              </div>
                </div>

            {/* Imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes del Vehículo (Opcional - mantiene las actuales si no seleccionas nuevas)
                  </label>
                  <input
                {...register("image")}
                    type="file"
                    multiple
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                <strong>💡 Consejo:</strong> Solo selecciona nuevas imágenes si quieres reemplazar las actuales.
                <br />
                Si no seleccionas nada, se mantendrán las imágenes existentes.
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Actualizar Vehículo
              </button>
            </div>
          </form>
        </div>
    </div>
    </>
  );
}
