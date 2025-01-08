import Express from "express";
import router from "./src/index.controller.js";
import dotenv from "dotenv";
import errorHandler from "./src/middleWares/errorHandler.js";
import morgan from "morgan";
import cors from "cors";


const app = Express();

dotenv.config();

app.use(Express.json());

app.use(cors()); // to allow all origins

app.use(morgan("dev")); // logger

app.use("/weather", router);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
