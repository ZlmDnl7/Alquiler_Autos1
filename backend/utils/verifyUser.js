import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/userModel.js";

// Función auxiliar para extraer tokens
const extractTokens = (req) => {
  let accessToken = null;
  let refreshTokenValue = null;
  
  // Buscar en headers
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization.split(" ")[1];
    if (authHeader) {
      const tokens = authHeader.split(",");
      refreshTokenValue = tokens[0];
      accessToken = tokens[1];
    }
  }
  
  // Buscar en cookies si no hay en headers
  if (!accessToken && req.cookies) {
    accessToken = req.cookies.access_token;
    refreshTokenValue = req.cookies.refresh_token;
  }
  
  return { accessToken, refreshTokenValue };
};

// Función auxiliar para manejar refresh token
const handleRefreshToken = async (refreshTokenValue, req, res, next) => {
  try {
    const decoded = jwt.verify(refreshTokenValue, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshTokenValue) {
      return next(errorHandler(403, "Invalid refresh token"));
    }

    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    await User.updateOne(
      { _id: user._id },
      { refreshToken: newRefreshToken }
    );

    req.user = decoded.id;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Función auxiliar para manejar access token
const handleAccessToken = async (accessToken, refreshTokenValue, req, res, next) => {
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
    req.user = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" && refreshTokenValue) {
      return handleRefreshToken(refreshTokenValue, req, res, next);
    }
    next(errorHandler(403, "Token is not valid"));
  }
};

export const verifyToken = async (req, res, next) => {
  console.log("🔐 VERIFY TOKEN MIDDLEWARE CALLED");
  console.log("📋 Headers:", req.headers);
  console.log("🔑 Authorization:", req.headers.authorization);
  console.log("🍪 Cookies:", req.cookies);
  
  const { accessToken, refreshTokenValue } = extractTokens(req);
  
  console.log("🔑 Access Token:", accessToken ? "✅ Presente" : "❌ Ausente");
  console.log("🔑 Refresh Token:", refreshTokenValue ? "✅ Presente" : "❌ Ausente");
  
  if (!accessToken && !refreshTokenValue) {
    console.log("❌ NO TOKENS FOUND");
    return next(errorHandler(403, "bad request no tokens provided"));
  }

  if (accessToken) {
    return handleAccessToken(accessToken, refreshTokenValue, req, res, next);
  } else {
    return handleRefreshToken(refreshTokenValue, req, res, next);
  }
};
