import axios from 'axios';
import redisClient from '../middleWares/redisClient.js';
import responses from '../helper/responses.js';
import locationAndMetricSchema from '../schemas/locations.schema.js'
import schemas from '../schemas/forecast.schema.js';
// import { MongoClient } from 'mongodb';

const forecastByLocation = async (req, res) => {
    const { error, value } = locationAndMetricSchema.validate(req.params);
    if (error) return responses.badRequest(res, error.message);
    const { location, unit } = value;

    const cacheKey = `${location}:${unit}:forecast`;

    try {
        // Check the cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit!');
            return responses.success(res, "Weather forecast fetched successfully (from cache)",JSON.parse(cachedData));
        }

        console.log('Cache miss! Fetching from Visual Crossing API...');
        const url = `${process.env.VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(location)}?unitGroup=${unit}&key=${process.env.VISUAL_CROSSING_API_KEY}&include=days&contentType=json`;

        const response = await axios.get(url);

        const forecast = response.data.days.slice(0, 7).map(day => ({
            date: day.datetime,
            high_temp: day.tempmax,
            low_temp: day.tempmin,
            condition: day.conditions,
            wind_speed: day.windspeed,
        }));

        const responseData = { location, forecast };

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

        return responses.success(res, 'Weather forecast fetched successfully (from API)',responseData);
    } catch (error) {
        console.error('Error fetching weather forecast:', error.message);
        return responses.notFound(res, 'Failed to fetch weather forecast');
    }
};

const dailyForecast = async (req, res) => {
    try {
        const { error, value } = schemas.daily.validate(req.query);
        if (error) return responses.badRequest(res, error.message);
        const { location, days } = value;
        const cacheKey = `forecast:${location}:${days}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log('Cache hit!');
            return JSON.parse(cachedData);
        }

        console.log('Cache miss. Fetching data from Visual Crossing API...');
        const apiKey = process.env.VISUAL_CROSSING_API_KEY;
        const apiUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${location}?unitGroup=metric&key=${apiKey}&include=days&elements=datetime,tempmax,tempmin,conditions,windspeed&days=${days}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }

        const data = await response.json();

        const forecast = data.days.map((day) => ({
            date: day.datetime,
            high_temp: day.tempmax,
            low_temp: day.tempmin,
            condition: day.conditions,
            wind_speed: day.windspeed,
        }));

        // Cache the response in Redis for 1 hour
        await redisClient.set(cacheKey, JSON.stringify(forecast), 'EX', 3600);

        forecast = { location: data.resolvedAddress, forecast };
        return responses.success(res, 'Daily weather forecast retrieved successfully', forecast);
    } catch (error) {
        console.error('Error fetching daily forecast:', error);
        return responses.internalServerError(res, 'Internal Server Error', 500);
    }
};

const hourlyForecast = async (req, res) => {

};

const forecastServices = {
    forecastByLocation,
    dailyForecast,
    hourlyForecast,
};

export default forecastServices;
