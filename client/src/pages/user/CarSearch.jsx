import { IconCalendarEvent, IconMapPinFilled, IconX } from "@tabler/icons-react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";


//reducers
import { setAvailableCars } from "../../redux/user/selectRideSlice";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { setSelectedData } from "../../redux/user/BookingDataSlice";
import dayjs from "dayjs";

const schema = z.object({
  dropoff_location: z.string().min(1, { message: "Ubicación de devolución requerida" }),
  pickup_district: z.string().min(1, { message: "Distrito de recogida requerido" }),
  pickup_location: z.string().min(1, { message: "Ubicación de recogida requerida" }),

  pickuptime: z.object({
    $d: z.instanceof(Date).refine((date) => date !== null && date !== undefined, {
      message: "Fecha de recogida no seleccionada",
    }),
  }),

  dropofftime: z.object(
    {
      $L: z.string(), // Language code
      $d: z.date(), // Date object
      $y: z.number(), // Year
      $M: z.number(), // Month (0-indexed)
      $D: z.number(), // Day of month
      $W: z.number(), // Day of week (0-indexed, starting from Sunday)
      $H: z.number(), // Hour
      $m: z.number(), // Minute
      $s: z.number(), // Second
      $ms: z.number(), // Millisecond
      $isDayjsObject: z.boolean(), // Indicator for Day.js object
    },
    { message: "Fecha de devolución requerida" }
  ),
});

const CarSearch = () => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup_district: "",
      pickup_location: "",
      dropoff_location: "",
      pickuptime: null,
      dropofftime: null,
    },
  });

  const navigate = useNavigate();
  // Ya no necesitamos estas variables para ubicaciones preestablecidas
  // const { districtData } = useSelector((state) => state.modelDataSlice);
  // const { fetchLov, isLoading } = useFetchLocationsLov();
  // const uniqueDistrict = districtData?.filter((cur, idx) => {
  //   return cur !== districtData[idx + 1];
  // });
  // const { selectedDistrict, wholeData, locationsOfDistrict } = useSelector((state) => state.selectRideSlice);

  const [pickup, setPickup] = useState(null);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  // Ya no necesitamos cargar ubicaciones preestablecidas
  // useEffect(() => {
  //   fetchLov();
  // }, []);

  // Ya no necesitamos estos useEffects
  // useEffect(() => {
  //   console.log("🔍 DEBUG FILTROS:");
  //   console.log("districtData:", districtData);
  //   console.log("uniqueDistrict:", uniqueDistrict);
  //   console.log("selectedDistrict:", selectedDistrict);
  //   console.log("locationsOfDistrict:", locationsOfDistrict);
  //   console.log("wholeData:", wholeData);
  // }, [districtData, uniqueDistrict, selectedDistrict, locationsOfDistrict, wholeData]);

  // useEffect(() => {
  //   if (selectedDistrict !== null) {
  //     const showLocationInDistrict = wholeData
  //       .filter((cur) => {
  //         return cur.district === selectedDistrict;
  //       })
  //       .map((cur) => cur.location);
  //     dispatch(setLocationsOfDistrict(showLocationInDistrict));
  //   }
  // }, [selectedDistrict]);

  // Helper function to clear form elements
  const clearFormElements = () => {
    const elements = ["pickup_district", "pickup_location", "dropoff_location"];
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = "";
      }
    });
  };

  // Helper function to reset form
  const resetForm = () => {
    reset({
      pickuptime: null,
      dropofftime: null,
    });
    clearFormElements();
  };

  // Helper function to make API request
  const searchVehicles = async (searchData) => {
    const res = await fetch("api/user/showSingleofSameModel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.message || "Error al buscar vehículos");
      return false;
    }

    const result = await res.json();
    dispatch(setAvailableCars(result));
    navigate("/availableVehicles");
    return true;
  };

  //search cars
  const hanldeData = async (data) => {
    try {
      if (!data) return;

      //preserving the selected data for later use
      dispatch(setSelectedData(data));

      const searchData = {
        pickupDate: data.pickuptime.$d,
        dropOffDate: data.dropofftime.$d,
        pickUpDistrict: data.pickup_district,
        pickUpLocation: data.pickup_location,
      };

      const success = await searchVehicles(searchData);
      if (success) {
        resetForm();
      }
    } catch (error) {
      console.log("Error  : ", error);
    }
  };

  //this is to ensure there will be 1 day gap between pickup and dropoff date
  const oneDayGap = pickup ? dayjs(pickup).add(1, "day") : dayjs().add(1, "day");

  return (
      <section id="booking-section" className="book-section relative z-10 mt-[50px]  mx-auto max-w-[1500px] bg-white">
        {/* overlay */}

        <div className="container bg-white">
          <div className="book-content   ">
            <div className="book-content__box ">
              <h2>Reservar un auto</h2>

              <p className="error-message">
                ¡Todos los campos son obligatorios! <IconX width={20} height={20} />
              </p>

              <p className="booking-done">
                Revisa tu email para confirmar la orden. <IconX width={20} height={20} />
              </p>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 ¿Para qué sirve?</strong> Este formulario te permite buscar autos disponibles 
                  según tu ubicación de recogida, devolución y fechas. <strong>Escribe cualquier ciudad o dirección</strong> - 
                  ¡No estás limitado a opciones preestablecidas!
                </p>
              </div>

              <form onSubmit={handleSubmit(hanldeData)}>
                <div className="box-form">
                  <div className="box-form__car-type">
                    <label htmlFor="pickup_district">
                      <IconMapPinFilled className="input-icon" /> &nbsp; Ciudad de Recogida <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name="pickup_district"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          id="pickup_district"
                          className="p-2 capitalize"
                          placeholder="Ej: Medellín, Bogotá, Nueva York..."
                          error={Boolean(errors.pickup_district)}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    {errors.pickup_district && <p className="text-red-500">{errors.pickup_district.message}</p>}
                  </div>

                  <div className="box-form__car-type ">
                    <label htmlFor="pickup_location">
                      <IconMapPinFilled className="input-icon" /> &nbsp; Dirección Específica de Recogida <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name="pickup_location"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          id="pickup_location"
                          className="md:mb-10 capitalize"
                          placeholder="Ej: Centro Comercial Santa Ana, Aeropuerto JFK..."
                          onChange={(e) => field.onChange(e.target.value)}
                          error={Boolean(errors.pickup_location)}
                        />
                      )}
                    />
                    {errors.pickup_location && <p className="text-red-500">{errors.pickup_location.message}</p>}
                  </div>

                  <div className="box-form__car-type">
                    <label>
                      <IconMapPinFilled className="input-icon" /> &nbsp; Dirección Específica de Devolución <p className="text-red-500">*</p>
                    </label>

                    <Controller
                      name="dropoff_location"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          error={Boolean(errors.dropoff_location)}
                          id="dropoff_location"
                          className="md-mb-10 capitalize"
                          placeholder="Ej: Hotel Hilton, Estación Central..."
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                    {errors.dropoff_location && <p className="text-red-500">{errors.dropoff_location.message}</p>}
                  </div>

                  <div className="box-form__car-time">
                    <label htmlFor="picktime" className="flex items-center">
                      <IconCalendarEvent className="input-icon" /> &nbsp; Fecha de Recogida <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name={"pickuptime"}
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={["DateTimePicker"]}>
                            <DateTimePicker
                              label="Hora de recogida"
                              {...field}
                              value={field.value}
                              minDate={dayjs()}
                              onChange={(newValue) => {
                                field.onChange(newValue); // Update the form field value
                                setPickup(newValue); // Update the pickup state
                              }}
                            />
                          </DemoContainer>
                        </LocalizationProvider>
                      )}
                    />
                    {errors.pickuptime && <p className="text-red-500">{errors.pickuptime.message}</p>}
                  </div>

                  <div className="box-form__car-time">
                    <label htmlFor="droptime" className="flex items-center">
                      <IconCalendarEvent className="input-icon" /> &nbsp; Fecha de Devolución <p className="text-red-500">*</p>
                    </label>
                    <Controller
                      name={"dropofftime"}
                      control={control}
                      render={({ field }) => (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={["DateTimePicker"]}>
                            <DateTimePicker label="Hora de devolución" {...field} value={field.value} minDate={pickup ? oneDayGap : dayjs()} />
                          </DemoContainer>
                        </LocalizationProvider>
                      )}
                    />
                    {errors.dropofftime && <p className="text-red-500">{errors.dropofftime.message}</p>}
                    {error && <p className="text-[8px] text-red-500">{error}</p>}
                  </div>

                  <button type="submit" className="book-content__box_button">
                    Buscar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
  );
};

export default CarSearch;
