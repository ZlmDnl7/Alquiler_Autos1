import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary, uploader, config } from "cloudinary";


export const cloudinaryConfig = (req, res, next) => {
  config({
    cloud_name: process.env.cloudinary_cloud_name,
    api_key: process.env.cloudinary_api_key,
    api_secret: process.env.cloudinary_api_secret,
   
  });

  next();
};

export { uploader, cloudinary } from "cloudinary";
