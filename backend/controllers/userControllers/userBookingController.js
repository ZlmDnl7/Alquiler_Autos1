import mongoose from "mongoose";
import Booking from "../../models/BookingModel.js";
import { errorHandler } from "../../utils/error.js";
import Razorpay from "razorpay";
import { availableAtDate } from "../../services/checkAvailableVehicle.js";
import Vehicle from "../../models/vehicleModel.js";
import nodemailer from "nodemailer";

export const BookCar = async (req, res, next) => {
  try {
    if (!req.body) {
      return next(errorHandler(401, "bad request on body"));
    }

    const {
      user_id,
      vehicle_id,
      totalPrice,
      pickupDate,
      dropoffDate,
      pickup_location,
      dropoff_location,
      pickup_district,
      razorpayPaymentId,
      razorpayOrderId,
    } = req.body;

    console.log("Datos recibidos en BookCar:", req.body);

    // Validar campos requeridos
    if (!user_id || !vehicle_id || !totalPrice || !pickupDate || !dropoffDate || !pickup_location || !dropoff_location) {
      return next(errorHandler(400, "Faltan campos requeridos"));
    }

    const book = new Booking({
      pickupDate: new Date(pickupDate),
      dropOffDate: new Date(dropoffDate),
      userId: user_id,
      pickUpLocation: pickup_location,
      vehicleId: vehicle_id,
      dropOffLocation: dropoff_location,
      pickUpDistrict: pickup_district || pickup_location,
      totalPrice: Number(totalPrice),
      razorpayPaymentId: razorpayPaymentId || "test_payment_id",
      razorpayOrderId: razorpayOrderId || "test_order_id",
                        status: "reservado",
    });

    console.log("Objeto Booking a guardar:", book);

    const booked = await book.save();
    console.log("Reserva guardada exitosamente:", booked);

    res.status(200).json({
      ok: true,
      message: "car booked successfully",
      booked,
    });
  } catch (error) {
    console.log("Error en BookCar:", error);
    next(errorHandler(500, "error while booking car: " + error.message));
  }
};

//createing razorpay instance
export const razorpayOrder = async (req, res, next) => {
  try {
    const { totalPrice, dropoff_location, pickup_district, pickup_location } =
      req.body;

    console.log(totalPrice)
    if (
      !totalPrice ||
      !dropoff_location ||
      !pickup_district ||
      !pickup_location
    ) {

      return next(errorHandler(400, "Missing Required Feilds Process Cancelled")) ;
    }
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: totalPrice * 100, // amount in smallest currency unit
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error occured in razorpayorder"));
  }
};

// -------------------- -------------------

// getting vehicles without booking for selected Date and location
export const getVehiclesWithoutBooking = async (req, res, next) => {
  try {
    const { pickUpDistrict, pickUpLocation, pickupDate, dropOffDate, model } = req.body;
    
    // Sanitizar datos de entrada para prevenir NoSQL injection
    const sanitizedPickUpDistrict = pickUpDistrict?.toString().trim();
    const sanitizedPickUpLocation = pickUpLocation?.toString().trim();

    if (!sanitizedPickUpDistrict || !sanitizedPickUpLocation)
      return next(errorHandler(409, "pickup District and location needed"));

    if (!pickupDate || !dropOffDate)
      return next(errorHandler(409, "pickup and dropoff date is required"));

    // Check if pickupDate is before dropOffDate
    if (pickupDate >= dropOffDate)
      return next(errorHandler(409, "Invalid date range"));

    const vehiclesAvailableAtDate = await availableAtDate(pickupDate, dropOffDate);

    if (!vehiclesAvailableAtDate) {
      return res.status(404).json({
        success: false,
        message: "No vehicles available for the specified time period.",
      });
    }

    const availableVehicles = vehiclesAvailableAtDate.filter(
      (cur) =>
        cur.district === pickUpDistrict &&
        cur.location === pickUpLocation &&
        cur.isDeleted === "false"
    );

    if (!availableVehicles) {
      return res.status(404).json({
        success: false,
        message: "No vehicles available at this location.",
      });
    }

    // If there is no next middleware after this one, send the response
    if (!req.route?.stack || req.route.stack.length === 1) {
      console.log("hello");
      console.log({ success: "true", data: availableVehicles });
      return res.status(200).json({
        success: true,
        data: availableVehicles,
      });
    }

    // If there is a next middleware, pass control to it
    res.locals.actionResult = [availableVehicles, model];
    next();
  } catch (error) {
    console.log(error);
    return next(
      errorHandler(500, "An error occurred while fetching available vehicles.")
    );
  }
};

//getting all variants of a model which are not booked
export const showAllVariants = async (req, res, next) => {
  try {
    const actionResult = res.locals.actionResult;
    const model = actionResult[1];

    if (!actionResult[0]) {
      next(errorHandler(404, "no actionResult"));
    }
    const allVariants = actionResult[0].filter((cur) => {
      return cur.model === model;
    });

    res.status(200).json(allVariants);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal error in showAllVariants"));
  }
};

//show i if more vehcles with same model available
export const showOneofkind = async (req, res, next) => {
  try {
    const actionResult = res.locals.actionResult;

    const modelsMap = {};
    const singleVehicleofModel = [];

    if (!actionResult) {
      next(errorHandler(404, "no actionResult"));
      return;
    }

    for (const cur of actionResult[0]) {
      if (!modelsMap[cur.model]) {
        modelsMap[cur.model] = true;
        singleVehicleofModel.push(cur);
      }
    }

    if (!singleVehicleofModel) {
      next(errorHandler(404, "no vehicles available"));
      return;
    }

    res.status(200).json(singleVehicleofModel);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "error in showOneofkind"));
  }
};

//  filtering vehicles
export const filterVehicles = async (req, res, next) => {
  try {
    if (!req.body) {
      next(errorHandler(401, "bad request no body"));
      return;
    }
    const transformedData = req.body;
    if (!transformedData) {
      next(errorHandler(401, "select filter option first"));
    }
    // Función auxiliar para extraer car types
    const extractCarTypes = (data) => {
      return data
        .filter(item => item.type === "car_type")
        .map(item => Object.keys(item).find(key => key !== "type"))
        .filter(Boolean);
    };

    // Función auxiliar para extraer transmitions
    const extractTransmitions = (data) => {
      return data
        .filter(item => item.type === "transmition")
        .flatMap(item => 
          Object.keys(item)
            .filter(key => key !== "type" && item[key])
        );
    };

    const generateMatchStage = (data) => {
      const carTypes = extractCarTypes(data);
      const transmitions = extractTransmitions(data);

      const conditions = [];
      if (carTypes.length > 0) {
        conditions.push({ car_type: { $in: carTypes } });
      }
      if (transmitions.length > 0) {
        conditions.push({ transmition: { $in: transmitions } });
      }

      return {
        $match: conditions.length > 0 ? { $and: conditions } : {}
      };
    };

    const matchStage = generateMatchStage(transformedData);

    const filteredVehicles = await Vehicle.aggregate([matchStage]);
    if (!filteredVehicles) {
      next(errorHandler(401, "no vehicles found"));
      return;
    }
    res.status(200).json({
      status: "success",
      data: {
        filteredVehicles,
      },
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error in fiilterVehicles"));
  }
};

export const findBookingsOfUser = async (req, res, next) => {
  try {
    console.log("🔍 findBookingsOfUser iniciado");
    console.log("📦 Request body:", req.body);
    
    if (!req.body) {
      console.log("❌ No hay request body");
      next(errorHandler(409, "_id of user is required"));
      return;
    }
    
    const { userId } = req.body;
    console.log("👤 User ID recibido:", userId);
    
    if (!userId) {
      console.log("❌ No hay userId en el body");
      next(errorHandler(409, "userId is required"));
      return;
    }
    
    const convertedUserId = mongoose.Types.ObjectId.createFromHexString(userId);
    console.log("🔄 User ID convertido:", convertedUserId);

    console.log("🔍 Buscando reservas en la base de datos...");
    
    const bookings = await Booking.aggregate([
      {
        $match: {
          userId: convertedUserId,
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $project: {
          _id: 0,
          bookingDetails: "$$ROOT",
          vehicleDetails: {
            $arrayElemAt: ["$result", 0],
          },
        },
      },
    ]);

    console.log("📊 Reservas encontradas:", bookings);
    console.log("📏 Cantidad de reservas:", bookings.length);
    
    // Verificar si hay reservas
    if (bookings.length === 0) {
      console.log("⚠️ No se encontraron reservas para este usuario");
    }

    res.status(200).json(bookings);
    console.log("✅ Respuesta enviada exitosamente");
  } catch (error) {
    console.log("💥 Error en findBookingsOfUser:", error);
    next(errorHandler(500, "internal error in findBookingOfUser"));
  }
};

//api to ge the latestbookings details
export const latestbookings = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    console.log(user_id);
    const convertedUserId = mongoose.Types.ObjectId.createFromHexString(user_id);

    const bookings = await Booking.aggregate([
      {
        $match: {
          userId: convertedUserId,
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $project: {
          _id: 0,
          bookingDetails: "$$ROOT",
          vehicleDetails: {
            $arrayElemAt: ["$result", 0],
          },
        },
      },
      {
        $sort:
          /**
           * Provide any number of field/order pairs.
           */
          {
            "bookingDetails.createdAt": -1,
          },
      },
      {
        $limit:
          /**
           * Provide the number of documents to limit.
           */
          1,
      },
    ]);

    if (!bookings) {
      res.status(404, "error no such booking");
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error in latestbookings"));
  }
};

//send booking details to user email
export const sendBookingDetailsEamil = (req, res, next) => {
  try {
    console.log("hello");
    const { toEmail, data } = req.body;
    console.log("hi");
    console.log(req.body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const generateEmailHtml = (bookingDetails, vehicleDetails) => {
      const pickupDate = new Date(bookingDetails.pickupDate);
      const dropOffDate = new Date(bookingDetails.dropOffDate);

      return `
          <div style="font-family: Arial, sans-serif; padding: 10px;">
              <h2>Booking Details</h2>
              <hr>
              <p><strong>Booking Id:</strong> ${bookingDetails._id}</p>
              <p><strong>Total Amount:</strong> ${bookingDetails.totalPrice}</p>
              <p><strong>Pickup Location:</strong> ${
                bookingDetails.pickUpLocation
              }</p>
              <p><strong>Pickup Date:</strong> ${pickupDate.getDate()}/${
        pickupDate.getMonth() + 1
      }/${pickupDate.getFullYear()} ${pickupDate.getHours()}:${pickupDate.getMinutes()}</p>
              <p><strong>Dropoff Location:</strong> ${
                bookingDetails.dropOffLocation
              }</p>
              <p><strong>Dropoff Date:</strong> ${dropOffDate.getDate()}/${
        dropOffDate.getMonth() + 1
      }/${dropOffDate.getFullYear()} ${dropOffDate.getHours()}:${dropOffDate.getMinutes()}</p>
              <h2>Vehicle Details</h2>
              <hr>
              <p><strong>Vehicle Number:</strong> ${
                vehicleDetails.registeration_number
              }</p>
              <p><strong>Model:</strong> ${vehicleDetails.model}</p>
              <p><strong>Company:</strong> ${vehicleDetails.company}</p>
              <p><strong>Vehicle Type:</strong> ${vehicleDetails.car_type}</p>
              <p><strong>Seats:</strong> ${vehicleDetails.seats}</p>
              <p><strong>Fuel Type:</strong> ${vehicleDetails.fuel_type}</p>
              <p><strong>Transmission:</strong> ${
                vehicleDetails.transmition
              }</p>
              <p><strong>Manufacturing Year:</strong> ${
                vehicleDetails.year_made
              }</p>
          </div>
      `;
    };

    const mailOptions = {
      from: process.env.EMAIL_HOST,
      to: toEmail,
      subject: "rentaride.shop booking details",
      html: generateEmailHtml(data[0].bookingDetails, data[0].vehicleDetails),
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json("Email sent successfully");
      }
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error in sendBookingDetailsEmail"));
  }
};

// Función para que los vendedores vean las reservas de sus autos
export const findBookingsForVendor = async (req, res, next) => {
  try {
    console.log("🔍 findBookingsForVendor iniciado");
    console.log("📦 Request body:", req.body);
    
    if (!req.body) {
      console.log("❌ No hay request body");
      next(errorHandler(409, "vendorId es requerido"));
      return;
    }
    
    const { vendorId } = req.body;
    console.log("🏪 Vendor ID recibido:", vendorId);
    
    if (!vendorId) {
      console.log("❌ No hay vendorId en el body");
      next(errorHandler(409, "vendorId es requerido"));
      return;
    }
    
    const convertedVendorId = mongoose.Types.ObjectId.createFromHexString(vendorId);
    console.log("🔄 Vendor ID convertido:", convertedVendorId);

    console.log("🔍 Buscando reservas de los autos del vendedor...");
    
    // Primero, ver todas las reservas
    const allBookings = await Booking.find({});
    console.log("📋 Total de reservas en la base de datos:", allBookings.length);
    
    // Ver los primeros 3 vehículos de las reservas
    if (allBookings.length > 0) {
      const firstVehicles = await Vehicle.find({ _id: { $in: allBookings.slice(0, 3).map(b => b.vehicleId) } });
      console.log("🚗 Primeros 3 vehículos de reservas:", firstVehicles.map(v => ({ id: v._id, name: v.name, addedBy: v.addedBy })));
    }
    
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $match: {
          "vehicleDetails.addedBy": convertedVendorId.toString(),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          _id: 0,
          bookingDetails: "$$ROOT",
          vehicleDetails: {
            $arrayElemAt: ["$vehicleDetails", 0],
          },
          userDetails: {
            $arrayElemAt: ["$userDetails", 0],
          },
        },
      },
    ]);

    console.log("📊 Reservas encontradas para el vendedor:", bookings);
    console.log("📏 Cantidad de reservas:", bookings.length);
    
    if (bookings.length === 0) {
      console.log("⚠️ No se encontraron reservas para este vendedor");
    }

    res.status(200).json(bookings);
    console.log("✅ Respuesta enviada exitosamente");
  } catch (error) {
    console.log("💥 Error en findBookingsForVendor:", error);
    next(errorHandler(500, "Error interno en findBookingsForVendor"));
  }
};

// Función para que los admins vean todas las reservas
export const findAllBookingsForAdmin = async (req, res, next) => {
  try {
    console.log("🔍 findAllBookingsForAdmin iniciado");
    
    console.log("🔍 Buscando todas las reservas...");
    
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          _id: 0,
          bookingDetails: "$$ROOT",
          vehicleDetails: {
            $arrayElemAt: ["$vehicleDetails", 0],
          },
          userDetails: {
            $arrayElemAt: ["$userDetails", 0],
          },
        },
      },
    ]);

    console.log("📊 Total de reservas encontradas:", bookings.length);
    
    res.status(200).json(bookings);
    console.log("✅ Respuesta enviada exitosamente");
  } catch (error) {
    console.log("💥 Error en findAllBookingsForAdmin:", error);
    next(errorHandler(500, "Error interno en findAllBookingsForAdmin"));
  }
};

// Función para actualizar estados existentes de inglés a español
export const updateExistingStatuses = async (req, res, next) => {
  try {
    console.log("🔄 Actualizando estados existentes...");
    
    // Actualizar estados antiguos a nuevos usando $switch para evitar problemas de "then"
    const result = await Booking.updateMany(
      { status: { $in: ["notBooked", "booked", "onTrip", "notPicked", "canceled", "overDue", "tripCompleted"] } },
      [
        {
          $set: {
            status: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "notBooked"] }, then: "noReservado" },
                  { case: { $eq: ["$status", "booked"] }, then: "reservado" },
                  { case: { $eq: ["$status", "onTrip"] }, then: "enViaje" },
                  { case: { $eq: ["$status", "notPicked"] }, then: "noRecogido" },
                  { case: { $eq: ["$status", "canceled"] }, then: "cancelado" },
                  { case: { $eq: ["$status", "overDue"] }, then: "vencido" },
                  { case: { $eq: ["$status", "tripCompleted"] }, then: "viajeCompletado" }
                ],
                default: "$status"
              }
            }
          }
        }
      ]
    );
    
    console.log("✅ Estados actualizados:", result);
    res.status(200).json({ message: "Estados actualizados exitosamente", result });
  } catch (error) {
    console.log("💥 Error actualizando estados:", error);
    next(errorHandler(500, "Error al actualizar estados"));
  }
};
