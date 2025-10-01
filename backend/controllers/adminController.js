import User from "../models/userModel.js";
import { errorHandler } from "../utils/error.js";

export const getAllUsers = async (req, res, next) => {
  try {
    // Obtener todos los usuarios, excluyendo la contraseña
    const users = await User.find({}, { password: 0, refreshToken: 0 });
    
    res.status(200).json(users);
  } catch (error) {
    next(errorHandler(500, "Error al obtener usuarios"));
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    // Contar usuarios por tipo
    const totalUsers = await User.countDocuments({ isAdmin: false, isVendor: false });
    const totalVendors = await User.countDocuments({ isVendor: true });
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    
    // Obtener usuarios recientes
    const recentUsers = await User.find(
      { isAdmin: false, isVendor: false },
      { username: 1, email: 1, createdAt: 1, profilePicture: 1 }
    )
    .sort({ createdAt: -1 })
    .limit(5);

    res.status(200).json({
      totalUsers,
      totalVendors,
      totalAdmins,
      recentUsers
    });
  } catch (error) {
    next(errorHandler(500, "Error al obtener estadísticas"));
  }
};
