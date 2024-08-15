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

//////////////////////////////////////

import connectDb from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({ path: "./env" });

const port = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`app listening on port : ${port}`);
    });
  })
  .catch((err) => {
    console.log(`Error Failed :- ${err}`);
  });
