import responses from "../helper/responses.js";
import axios from "axios";
import redisClient from '../middleWares/redisClient.js';
import locationAndMetricSchema from "../schemas/locations.schema.js";
import getCoordinates from "../helper/getCoordinates.js";

const getAirQuality = async (req, res) => {
    try {
        // Validate query parameters
        const { error, value } = locationAndMetricSchema.validate(req.query);
        if (error)
            return responses.badRequest(res, 'Invalid query parameters', error.details);
        const { location } = value;

        const cacheKey = `airQuality:${location}`;
        const cachedData = await redisClient.get(cacheKey);
    
        if (cachedData) {
            console.log(`Cache hit for key: ${cacheKey}`);
            return responses.success(res, JSON.parse(cachedData));
        }
    
        console.log(`Cache miss for key: ${cacheKey}`);
    
        // Fetch weather data from Visual Crossing API
        const visualCrossingUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(location)}/today?unitGroup=metric&key=${process.env.VISUAL_CROSSING_API_KEY}`;
        const weatherResponse = await axios.get(visualCrossingUrl);
        if (!weatherResponse || !weatherResponse.data || !weatherResponse.data.days) {
            return responses.notFound(res, 'Weather data not found for the specified location.');
        }
        
        const dayData = weatherResponse.data.days[0];
        const temperature = dayData?.temp;
        const { lat, lon } = await getCoordinates(location);

        // Fetch air quality data from OpenWeatherMap API
        const airQualityUrl = `${process.env.AIR_QUALITY_API_BASE_URL}?lat=${lat}&lon=${lon}&APPID=${process.env.AIR_QUALITY_API_KEY}`;
        const airQualityResponse = await axios.get(airQualityUrl);
    
        if (!airQualityResponse || !airQualityResponse.data) {
            return responses.notFound(res, 'Air quality data not found for the specified location.');
        }

        const { aqi: airQualityIndex, list: pollutants } = airQualityResponse.data;
        
        // Extract specific pollutants (PM2.5, PM10, CO, NO2, SO2)
        const pm2_5 = pollutants[0]?.components?.pm2_5 || "N/A";
        const pm10 = pollutants[0]?.components?.pm10 || "N/A";
        const no2 = pollutants[0]?.components?.no2 || "N/A";
        const co = pollutants[0]?.components?.co || "N/A";
        const so2 = pollutants[0]?.components?.so2 || "N/A";

        const airQualityStatus =
            airQualityIndex > 200
            ? 'Unhealthy'
            : airQualityIndex > 100
            ? 'Moderate'
            : 'Good';
        const recommendation =
            airQualityStatus === 'Unhealthy'
            ? 'Avoid outdoor activities and wear a mask.'
            : airQualityStatus === 'Moderate'
            ? 'Consider limiting outdoor activities during peak hours.'
            : 'Air quality is good, no precautions necessary.';

        const responseData = {
            location,
            temperature,
            airQualityIndex,
            airQualityStatus,
            pm2_5,
            pm10,
            no2,
            co,
            so2,
            recommendation,
            lat,
            lon,
        };
    
        // Store the response in Redis cache for 1 hour
        await redisClient.set(cacheKey, JSON.stringify(responseData), 'EX', 3600);
        return responses.success(res, responseData);
    } catch (error) {
        console.error(`Error fetching air quality data: ${error.message}`);
        return responses.internalServerError(res, 'Internal Server Error', error.message);
    }
};

export default getAirQuality;