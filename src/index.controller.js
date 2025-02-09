import { Router } from "express";
import locationFunctions from "./services/location.service.js";
import forecastServices from "./services/forecast.service.js";
import getHistoricalWeather from "./services/history.service.js";
import getAlerts from "./services/alerts.service.js";
import settingServices from "./services/settings.service.js";
import getWeatherForMultipleLocations from "./services/current.service.js";
import getSupportedCities from "./services/cities.service.js";
import getRainChance from "./services/rain.service.js";
import getUVIndex from "./services/uv.service.js";
import travelPlannerForecast from "./services/travelplanner.service.js";
import getAgricultureWeather from "./services/agriculture.service.js";
import getAirQuality from "./services/airquality.service.js";
import eventPlanner from "./services/eventsplanner.service.js";
import getDroughtMonitor from "./services/droughtmonitor.service.js";
import getEnergySaverRecommendations from "./services/energysaver.service.js";
import getSeasonalTrends from "./services/seasonalTrends.service.js";

const router = new Router();

router.get("/byLocation/:location", locationFunctions.getWeatherByLocation);

router.get("/forecast/:location", forecastServices.forecastByLocation);
router.get("/forecast/daily/:location", forecastServices.dailyForecast);
router.get("/forecast/hourly/:location", forecastServices.hourlyForecast);

router.get("/historical/:location", getHistoricalWeather);

router.get("/alerts/:location", getAlerts);

router.get("/locations/saved", locationFunctions.getSavedLocations);
router.post("/locations/:location/save", locationFunctions.saveLocation);

router.get("/settings/:user_id", settingServices.getSettings);
router.post("/settings/:user_id", settingServices.postSettings);

router.get("/current", getWeatherForMultipleLocations);

router.get("/cities", getSupportedCities);

router.get("/rain-chance", getRainChance);

router.get("/uv-index", getUVIndex);

router.get("/travel-planner", travelPlannerForecast);

router.get("/agriculture", getAgricultureWeather);

router.get("/air-quality", getAirQuality);

router.get("/events-planner", eventPlanner);

router.get("/drought-monitor", getDroughtMonitor);

router.get("/energy-saver", getEnergySaverRecommendations);

router.get("/seasonal-trends", getSeasonalTrends);

export default router;
