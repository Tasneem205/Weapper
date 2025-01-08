import axios from 'axios';
import redisClient from '../middleWares/redisClient.js';
import responses from '../helper/responses.js';
import locationAndMetricSchema from '../schemas/locations.schema.js'

const VISUAL_CROSSING_BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

const getWeatherByLocation = async (req, res) => {
    try {
        const { error, value } = locationAndMetricSchema.validate(req.params);
        if (error) return responses.badRequest(res, "validaiton error");
        console.log(value);
        const { location, unit } = value;
        
        // Check cache in Redis
        const cachedWeather = await redisClient.get(`${location}:${unit}`);
        if (cachedWeather) {
            console.log('Cache hit!');
            const weatherData = JSON.parse(cachedWeather);
            return responses.success(res, "Weather fetched successfully", weatherData);
        }
        console.log('Cache miss! Fetching from Visual Crossing API...');
        const APIresponse = await axios.get(
            `${VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(location)}`,
            {
                params: {
                    key: process.env.VISUAL_CROSSING_API_KEY,
                    unitGroup: unit === 'metric' ? 'metric' : 'us',
                },
            }
        );
        if (!APIresponse) return responses.notFound(res, "Data not found");
        const weatherData = APIresponse.data;
        const data = {
            location: weatherData.address,
            temperature: weatherData.currentConditions.temp,
            condition: weatherData.currentConditions.conditions,
            humidity: weatherData.currentConditions.humidity,
            wind_speed: weatherData.currentConditions.windspeed,
            unit,
            timestamp: new Date().toISOString(),
        };
        // save to cache
        await redisClient.setEx(`${location}:${unit}`, 3600, JSON.stringify(data));
        return responses.success(res, "Weather fetched successfully", data);
        
    } catch (error) {
        console.log(`Faild somehow look \n ${error}`);
        return responses.internalServerError(res);
    }
};

const locationFunctions = {
    getWeatherByLocation,
};

export default locationFunctions;
/*
router.get("/{location}", () => {});
router.get("/locations/{location}/save", () => {});
router.get("/locations/saved", () => {});
router.post("/locations/saved", () => {});

*/