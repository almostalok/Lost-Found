import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();


//step 1:-Configure cloudinary

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })

//step 2:-create cloudinary storage

    const storage=new CloudinaryStorage({
        cloudinary,
        params:{
            folder:"lost-found-items",
            allowed_formats:['jpg','jpeg','png'],

        },
    })

//step 3:-create upload middleware
const upload =multer({storage});

export default upload;