import { Router } from "express";
import locationFunctions from "./services/location.service.js";

const router = new Router();

router.get("/:location", locationFunctions.getWeatherByLocation);

router.get("/forecast/{location}", () => {});
router.get("/forecast/daily", () => {});
router.get("/forecast/hourly", () => {});

router.get("/historical/{location}", () => {});

router.get("/alerts/{location}", () => {});

router.get("/locations/saved", () => {});
router.post("/locations/:location/save", locationFunctions.saveLocation);

router.get("/settings", () => {});
router.post("/settings", () => {});

router.get("/current}", () => {});

router.get("/cities", () => {});

router.get("/rain-chance", () => {});

router.get("/uv-index", () => {});

router.get("/travel-planner", () => {});

router.get("/agriculture", () => {});

router.get("/air-quality", () => {});

router.get("/events-planner", () => {});

router.get("/drought-monitor", () => {});

router.get("/energy-saver", () => {});

router.get("/seasonal-trends", () => {});

export default router;
