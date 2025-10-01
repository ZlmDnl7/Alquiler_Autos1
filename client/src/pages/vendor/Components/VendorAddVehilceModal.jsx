
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";

const VendorAddProductModal = ({ onClose }) => {
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const { _id } = useSelector((state) => state.user.currentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Observar cambios en el campo de imágenes
  const imageFiles = watch("image");

  // Manejar selección de imágenes
  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    
    if (newFiles.length === 0) {
      return;
    }

    // Calcular el total de imágenes (las existentes + las nuevas)
    const totalImages = selectedImages.length + newFiles.length;
    
    if (totalImages > 5) {
      toast.error(`Máximo 5 imágenes permitidas. Ya tienes ${selectedImages.length} y estás intentando agregar ${newFiles.length}`);
      e.target.value = null;
      return;
    }

    // Validar tipos de archivo
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error(`${file.name} es demasiado grande (máximo 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length !== newFiles.length) {
      e.target.value = null;
      return;
    }

    // AGREGAR las nuevas imágenes a las existentes (no reemplazar)
    setSelectedImages(prevImages => [...prevImages, ...validFiles]);
    
    // Limpiar el input para permitir nuevas selecciones
    e.target.value = null;
    
    toast.success(`Imágenes agregadas. Total: ${selectedImages.length + validFiles.length}/5`);
  };

  // Eliminar imagen específica
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    
    // Crear un nuevo FileList para el input
    const dt = new DataTransfer();
    newImages.forEach(file => dt.items.add(file));
    
    // Actualizar el input
    const input = document.querySelector('input[name="image"]');
    if (input) {
      input.files = dt.files;
    }
  };

  const onSubmit = async (data) => {
    if (selectedImages.length === 0) {
      toast.error("Debes subir al menos una imagen del vehículo");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Datos básicos del vehículo
      formData.append("registeration_number", data.registeration_number);
      formData.append("company", data.company);
      formData.append("name", data.name);
      formData.append("title", data.title);
      formData.append("base_package", data.base_package);
      formData.append("price", data.price);
      formData.append("year_made", data.year_made);
      formData.append("fuel_type", data.fuel_type);
      formData.append("car_type", data.car_type);
      formData.append("location", data.location);
      formData.append("district", data.district);
      formData.append("addedBy", _id);

      // Imágenes del vehículo
      selectedImages.forEach((file) => {
        formData.append("image", file);
      });

      const res = await fetch("/api/vendor/vendorAddVehicle", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Vehículo enviado para aprobación del administrador");
        reset();
        setSelectedImages([]);
        onClose(); // Cerrar modal
        // Recargar la página para mostrar el nuevo vehículo
        window.location.reload();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Error al crear vehículo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Toaster />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Vehículo</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoMdClose size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Primera fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Registro *
                </label>
                <input
                  {...register("registeration_number", { required: "Campo requerido" })}
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
                  Precio por Día (€) *
                </label>
                <input
                  {...register("price", { 
                    required: "Campo requerido",
                    min: { value: 1, message: "El precio debe ser mayor a 0" }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50"
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
                  {...register("year_made", { 
                    required: "Campo requerido",
                    min: { value: 1990, message: "Año mínimo 1990" },
                    max: { value: 2025, message: "Año máximo 2025" }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2023"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transmisión *
                </label>
                <select
                  {...register("transmition_type", { required: "Campo requerido" })}
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
            </div>

            {/* Sexta fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  {...register("description")}
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
                Imágenes del Vehículo * (Mínimo 1, máximo 5)
                    </label>
              
              {/* Input de archivos */}
                    <input
                {...register("image")}
                      type="file"
                      multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Información de ayuda */}
              <p className="text-sm text-gray-500 mt-1">
                <strong>💡 Consejo:</strong> Puedes seleccionar imágenes en múltiples selecciones. 
                <br />
                Selecciona 1-2 imágenes cada vez para mejor control. Formatos: JPG, PNG, GIF.
                <br />
                <strong>Importante:</strong> La primera imagen será la principal del vehículo.
              </p>

              {/* Vista previa de imágenes seleccionadas */}
              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Imágenes seleccionadas ({selectedImages.length}/5):
                    </p>
                    {selectedImages.length < 5 && (
                      <p className="text-xs text-blue-600">
                        Puedes agregar {5 - selectedImages.length} imagen{5 - selectedImages.length !== 1 ? 'es' : ''} más
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Vista previa ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Eliminar imagen"
                        >
                          ×
                        </button>
                        <div className={`absolute bottom-1 left-1 text-white text-xs px-2 py-1 rounded ${
                          index === 0 ? 'bg-green-600' : 'bg-black bg-opacity-70'
                        }`}>
                          {index === 0 ? "⭐ Principal" : `${index + 1}`}
                        </div>
                        <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Información adicional */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>📋 Instrucciones:</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• <strong>Imagen Principal:</strong> Aparecerá primero en el catálogo</li>
                      <li>• <strong>Orden:</strong> Las imágenes se muestran en el orden de selección</li>
                      <li>• <strong>Agregar más:</strong> Selecciona archivos nuevamente para agregar</li>
                      <li>• <strong>Eliminar:</strong> Pasa el mouse sobre una imagen y haz clic en ×</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Validación de errores */}
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
              )}
              </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedImages.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Crear Vehículo"}
              </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
};

export default VendorAddProductModal;
