import responses from "../helper/responses.js";
import axios from "axios";
import redisClient from '../middleWares/redisClient.js';
import locationAndSeasonSchema from "../schemas/seasonalTrends.schema.js";

const seasonDateRanges = {
    winter: { start: "2023-12-21", end: "2024-03-20" },
    spring: { start: "2023-03-21", end: "2023-06-20" },
    summer: { start: "2023-06-21", end: "2023-09-20" },
    fall: { start: "2023-09-21", end: "2023-12-20" },
    autumn: { start: "2023-09-21", end: "2023-12-20" }
};


const getSeasonalTrends = async (req, res) => {
    try {
        // Validate query parameters
        const { error, value } = locationAndSeasonSchema.validate(req.query);
        if (error)
            return responses.badRequest(res, 'Invalid query parameters', error.details);

        const { location, season } = value;

        // Use fixed date ranges for last year
        const { start, end } = seasonDateRanges[season.toLowerCase()];
        const startDate = start;
        const endDate = end;

        // Check Redis cache
        const cacheKey = `seasonalTrends:${location}:${season}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`Cache hit for key: ${cacheKey}`);
            return responses.success(res, JSON.parse(cachedData));
        }

        console.log(`Cache miss for key: ${cacheKey}`);

        // Call Visual Crossing API
        const apiKey = process.env.VISUAL_CROSSING_API_KEY;
        const visualCrossingUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${location}/${startDate}/${endDate}?unitGroup=metric&aggregateHours=24&key=${apiKey}`;

        const weatherResponse = await axios.get(visualCrossingUrl);
        
        if (!weatherResponse || !weatherResponse.data) {
            return responses.notFound(res, 'Seasonal weather data not found for the specified location.');
        }
        
        // Process the response data
        const seasonalData = weatherResponse.data;
        console.log("hi");
        console.log(seasonalData.days[0]);
        const averageTemp = seasonalData.days.reduce((sum, day) => sum + day.temp, 0) / seasonalData.days.length || null;
        const averagePrecipitation = seasonalData.days.reduce((sum, day) => sum + day.precip, 0) || "No Rain";
        const commonConditions = [...new Set(seasonalData.days.map(day => day.conditions))];

        const responseData = {
            location,
            season,
            averageTemp,
            averagePrecipitation,
            commonConditions,
        };

        // Cache response for 24 hours
        await redisClient.set(cacheKey, JSON.stringify(responseData), 'EX', 86400);

        return responses.success(res, responseData);
    } catch (error) {
        console.error(`Error fetching seasonal trends: ${error.message}`);
        return responses.internalServerError(res, 'Internal Server Error', error.message);
    }
};

export default getSeasonalTrends;
