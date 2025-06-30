import responses from "../helper/responses.js";
import axios from "axios";
import redisClient from "../middleWares/redisClient.js";
import locationAndDateRangeSchema from "../schemas/dateRange.schema.js";
import getCoordinates from "../helper/getCoordinates.js";

const getEnergySaverRecommendations = async (req, res) => {
    try {
        // Validate query parameters
        const { error, value } = locationAndDateRangeSchema.validate(req.query);
        if (error) 
            return responses.badRequest(res, "Invalid query parameters", error.details);
        
        const { location, dateRange } = value;

        const cacheKey = `energySaver:${location}:${dateRange || "today"}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log(`Cache hit for key: ${cacheKey}`);
            return responses.success(res, cachedData);
        }

        console.log(`Cache miss for key: ${cacheKey}`);
        
        const { lat, lon } = await getCoordinates(location);
        const [startDate, endDate] = (dateRange || "today:today").split(":");
        const visualCrossingUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${lat},${lon}?startDate=${startDate}&endDate=${endDate}&unitGroup=metric&key=${process.env.VISUAL_CROSSING_API_KEY}`;        
        console.log(visualCrossingUrl);
        const weatherResponse = await axios.get(visualCrossingUrl);
        if (!weatherResponse || !weatherResponse.data || !weatherResponse.data.days) {
            return responses.notFound(res, "Weather data not found for the specified location.");
        }

        const forecastDays = weatherResponse.data.days;
        const averageTemp = forecastDays.reduce((sum, day) => sum + day.temp, 0) / forecastDays.length;
        const mainCondition = forecastDays[0]?.conditions || "Unknown";

        // Generate energy-saving recommendations
        const recommendations = [];
        if (averageTemp > 25) {
            recommendations.push(
                "Use fans instead of air conditioning to save energy.",
                "Close blinds to block out heat and reduce cooling costs."
            );
        } else if (averageTemp < 15) {
            recommendations.push(
                "Lower thermostat settings to save heating costs.",
                "Ensure windows and doors are properly sealed to retain heat."
            );
        } else {
            recommendations.push("Enjoy moderate weather without heavy use of HVAC systems.");
        }

        const responseData = {
            location,
            forecast: {
                averageTemp: Math.round(averageTemp),
                condition: mainCondition,
            },
            recommendations,
        };

        // Store the response in Redis cache for 1 hour
        await redisClient.set(cacheKey, JSON.stringify(responseData), { ex: 3600 });

        return responses.success(res, responseData);
    } catch (error) {
        console.error(`Error fetching energy-saver data: ${error.message}`);
        return responses.internalServerError(res, "Internal Server Error", error.message);
    }
};

export default getEnergySaverRecommendations;
