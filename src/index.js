import connectDb from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

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
