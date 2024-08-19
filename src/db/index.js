import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `Mongodb connected at :- ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`mongodb connection error `, error);
    process.exit(1);
  }
};

export default connectDb;

//////////////////////////////////////
// 2nd way to connect database

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// import express from "express";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// database connectivity
// (async () => {
//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.MONGODB_URI}/${DB_NAME}`
//     );
//     console.log(`\n Mongodb connected ${connectionInstance.connection.host}`);
//     app.on("error", (error) => {
//       console.log("Error : ", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`app is listing on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("Error :", error);
//     throw error;
//   }
// })();
