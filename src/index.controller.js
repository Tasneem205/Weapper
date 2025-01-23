import { Router } from "express";
import locationFunctions from "./services/location.service.js";
import forecastServices from "./services/forecast.service.js";
import getHistoricalWeather from "./services/history.service.js";
import getAlerts from "./services/alerts.service.js";

const router = new Router();

router.get("/:location", locationFunctions.getWeatherByLocation);

router.get("/forecast/:location", forecastServices.forecastByLocation);
router.get("/forecast/daily/:location", forecastServices.dailyForecast);
router.get("/forecast/hourly/:location", forecastServices.hourlyForecast);

router.get("/historical/:location", getHistoricalWeather);

router.get("/alerts/:location", getAlerts);

router.get("/locations/saved", locationFunctions.getSavedLocations);
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
