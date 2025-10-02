import Booking from '../../models/BookingModel.js'
import mongoose from 'mongoose'
import { errorHandler } from '../../utils/error.js'

export const vendorBookings = async (req, res, next) => {
    try {
        const { vendorVehicles } = req.body || {};
        
        // Construir pipeline de agregación
        const pipeline = [
          {
            $lookup: {
              from: "vehicles",
              localField: "vehicleId",
              foreignField: "_id",
              as: "vehicleDetails",
            },
          },
          {
            $unwind: {
              path: "$vehicleDetails",
            },
          },
        ];

        // Agregar filtro por vehículos del vendor si se proporciona
        if (vendorVehicles && Array.isArray(vendorVehicles) && vendorVehicles.length > 0) {
          // Validar y sanitizar los IDs de vehículos
          const validVehicleIds = vendorVehicles
            .filter(id => mongoose.Types.ObjectId.isValid(id))
            .map(id => mongoose.Types.ObjectId.createFromHexString(id));
          
          if (validVehicleIds.length > 0) {
            pipeline.push({
              $match: {
                "vehicleDetails._id": { $in: validVehicleIds }
              }
            });
          }
        }

        const bookings = await Booking.aggregate(pipeline);
    
        if (!bookings) {
          next(errorHandler(404, "no bookings found"));
        }

      
    
        res.status(200).json(bookings);
      } catch (error) {
        console.log(error);
        next(errorHandler(500, "error in allBookings"));
      }
  };
  