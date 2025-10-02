import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/userModel.js";

export const verifyToken = async (req, res, next) => {
  console.log("🔐 VERIFY TOKEN MIDDLEWARE CALLED");
  console.log("📋 Headers:", req.headers);
  console.log("🔑 Authorization:", req.headers.authorization);
  console.log("🍪 Cookies:", req.cookies);
  
  // Buscar token en headers O en cookies
  let accessToken = null;
  let refreshTokenValue = null;
  
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization.split(" ")[1];
    if (authHeader) {
      const tokens = authHeader.split(",");
      refreshTokenValue = tokens[0];
      accessToken = tokens[1];
    }
  }
  
  // Si no hay en headers, buscar en cookies (solo las nuestras)
  if (!accessToken && req.cookies) {
    accessToken = req.cookies.access_token;
    refreshTokenValue = req.cookies.refresh_token;
  }
  
  console.log("🔑 Access Token:", accessToken ? "✅ Presente" : "❌ Ausente");
  console.log("🔑 Refresh Token:", refreshTokenValue ? "✅ Presente" : "❌ Ausente");
  
  if (!accessToken && !refreshTokenValue) {
    console.log("❌ NO TOKENS FOUND");
    return next(errorHandler(403, "bad request no tokens provided"));
  }

  if (!accessToken) {
    if (!refreshTokenValue) {
      return next(errorHandler(401, "You are not authenticated"));
    }

    try {
      const decoded = jwt.verify(refreshTokenValue, process.env.REFRESH_TOKEN);
      const user = await User.findById(decoded.id);

      if (!user) return next(errorHandler(403, "Invalid refresh token"));

      if (user.refreshToken !== refreshTokenValue)
        return next(errorHandler(403, "Invalid refresh token"));

      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15m" }
      );
      const newRefreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN,
        { expiresIn: "7d" }
      );

      // Update the refresh token in the database for the user
      await User.updateOne(
        { _id: user._id },
        { refreshToken: newRefreshToken }
      );

      req.user = decoded.id; //setting req.user so that next middleware in this cycle can acess it
      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  } else {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
      req.user = decoded.id; //setting req.user so that next middleware in this cycle can acess it
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        if (!refreshTokenValue) {
          return next(errorHandler(401, "You are not authenticated"));
        }
        // Access token expired, try to refresh it
        //try to refresh it
      } else {
        next(errorHandler(403, "Token is not valid"));
      }
    }
  }
};
