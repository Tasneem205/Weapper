import Express from "express";
import router from "./src/index.controller.js";
import dotenv from "dotenv";
import errorHandler from "./src/middleWares/errorHandler.js";
import morgan from "morgan";
import cors from "cors";
import { httpServerHandler } from 'cloudflare:node';


const app = Express();

dotenv.config();

app.use(Express.json());

app.use(cors()); // to allow all origins

app.use(morgan("dev")); // logger

app.use("/weather", router);

app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the fetch handler for Cloudflare Workers in production
export default {
  fetch: httpServerHandler(app)
};
