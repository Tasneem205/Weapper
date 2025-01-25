import responses from "../helper/responses.js";
import axios from "axios";
import redisClient from "../middleWares/redisClient.js";
import locationAndDateRangeSchema from "../schemas/dateRange.schema.js";

const getDroughtMonitor = async (req, res) => {
    try {
        console.log(req.query);
        const { error, value } = locationAndDateRangeSchema.validate(req.query);
        if (error) {
            return responses.badRequest(res, error.details);
        }

        const { location, dateRange } = value;

        const [startDate, endDate] = dateRange
            ? dateRange.split(":")
            : [
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                  new Date().toISOString().split("T")[0],
              ];

        const cacheKey = `droughtMonitor:${location}:${startDate}:${endDate}`;
        // const cachedData = await redisClient.get(cacheKey);

        // if (cachedData) {
        //     console.log(`Cache hit for key: ${cacheKey}`);
        //     return responses.success(res, JSON.parse(cachedData));
        // }

        console.log(`Cache miss for key: ${cacheKey}`);

        // Fetch weather data from Visual Crossing API
        const visualCrossingUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(location)}/${startDate}/${endDate}?unitGroup=metric&key=${process.env.VISUAL_CROSSING_API_KEY}`;
        console.log(visualCrossingUrl);
        const weatherResponse = await axios.get(visualCrossingUrl);

        if (!weatherResponse || !weatherResponse.data) {
            return responses.notFound(res, "Weather data not found for the specified location.");
        }

        const { days } = weatherResponse.data;
        const totalPrecipitation = days.reduce((total, day) => total + (day.precip || 0), 0);

        // Simulate soil moisture and drought level based on precipitation
        const soilMoisture = totalPrecipitation < 10 ? "Low" : totalPrecipitation < 50 ? "Moderate" : "High";
        const droughtLevel = totalPrecipitation < 10 ? "Severe" : totalPrecipitation < 30 ? "Moderate" : "Low";

        const recommendation =
            droughtLevel === "Severe"
                ? "Conserve water and avoid unnecessary outdoor irrigation."
                : droughtLevel === "Moderate"
                ? "Practice water conservation and monitor soil moisture levels."
                : "Water levels are sufficient, but maintain sustainable practices.";

        const responseData = {
            location,
            droughtData: {
                precipitation: { total: totalPrecipitation, unit: "mm" },
                soilMoisture,
                droughtLevel,
            },
            recommendation,
        };

        // Store the response in Redis cache for 1 hour
        await redisClient.set(cacheKey, JSON.stringify(responseData), "EX", 3600);

        // Send response
        return responses.success(res, responseData);
    } catch (error) {
        console.error(`Error fetching drought data: ${error.message}`);
        return responses.internalServerError(res, "Internal Server Error", error.message);
    }
};

export default getDroughtMonitor;
