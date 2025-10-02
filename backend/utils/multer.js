import multer from "multer";
import DatauriParser from "datauri/parser.js";

const storage = multer.memoryStorage();
//configureing multer to appload single file
export const multerUploads = multer({ storage }).array("image", 5);

const parser = new DatauriParser();

export const dataUri = (req) => {
  const encodedFiles = [];
  for (const cur of req.files) {
    //converts buffer to base64
    let base64 = Buffer.from(cur.buffer, "base64").toString("base64");
    //adding cloudinary supporting format to base64
    let base64CloudinaryFormat = `data:image/jpeg;base64,${base64}`;
    encodedFiles.push({ data: base64CloudinaryFormat, filename: cur.originalname });
  }
  return encodedFiles;
};


//configureing multer to upload multiple files
export const multerMultipleUploads = multer({ storage }).array("image", 5);

// converting buffer to base64 - reusing dataUri function
export const base64Converter = dataUri;


