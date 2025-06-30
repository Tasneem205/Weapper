import responses from '../helper/responses.js';
import redisClient from '../middleWares/redisClient.js';
import axios from 'axios';
import locationAndMetricSchema from '../schemas/locations.schema.js';

const getWeatherForMultipleLocations = async (req, res) => {
    try {
        console.log("Fetching weather for multiple locations...");
        // Extract query parameters
        const { error, value: {location, unit} } = locationAndMetricSchema.validate(req.query);
        if (error) return responses.badRequest(res, `Validation error\n ${error}`);

        // Split the locations into an array
        const locationList = location.split(',').map((loc) => loc.trim());
        const weatherData = {};

        // Iterate through each location and fetch weather
        for (const location of locationList) {
            try {
                // Check cache in Redis
                const cachedWeather = await redisClient.get(`${location}:${unit}`);
                if (cachedWeather) {
                    console.log(`Cache hit for ${location}!`);
                    weatherData[location] = cachedWeather;
                    continue;
                }

                // Fetch weather data from Visual Crossing API
                console.log(`Cache miss for ${location}. Fetching from Visual Crossing API...`);
                const APIresponse = await axios.get(
                    `${process.env.VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(location)}`,
                    {
                        params: {
                            key: process.env.VISUAL_CROSSING_API_KEY,
                            unitGroup: unit,
                        },
                    }
                );

                if (!APIresponse) {
                    weatherData[location] = "Weather data not found";
                    continue;
                }

                const weatherInfo = APIresponse.data;
                const data = {
                    location: weatherInfo.address,
                    temperature: weatherInfo.currentConditions.temp,
                    condition: weatherInfo.currentConditions.conditions,
                    humidity: weatherInfo.currentConditions.humidity,
                    wind_speed: weatherInfo.currentConditions.windspeed,
                    unit,
                    timestamp: new Date().toISOString(),
                };

                // Save data to Redis cache
                await redisClient.setex(`${location}:${unit}`, 3600, JSON.stringify(data));
                weatherData[location] = data;
            } catch (error) {
                console.log(`Failed to fetch weather for ${location}: ${error}`);
                weatherData[location] = "Error fetching weather data";
            }
        }

        return responses.success(res, "Weather data fetched successfully", weatherData);
    } catch (error) {
        console.log(`Failed to fetch weather for multiple locations:\n${error}`);
        return responses.internalServerError(res);
    }
};

export default getWeatherForMultipleLocations;