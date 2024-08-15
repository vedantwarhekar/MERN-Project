import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration(CONNECTION OF CLOUDINARY)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // if path is not valid than return
    if (!localFilePath) return;
    //otherwise upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    console.log(`file has been uploaded sucessfully on cloud ${response.url}`);
    
    //chatgpt suggestion
    // Remove the locally saved temporary file as the upload operation failed
    //fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the local operation failed
    return null;
  }
};

export { uploadOnCloudinary };
