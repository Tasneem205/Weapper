import axios from 'axios';
import redisClient from '../middleWares/redisClient.js';
import responses from '../helper/responses.js';
import locationAndMetricSchema from '../schemas/locations.schema.js'
import schemas from '../schemas/forecast.schema.js';

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
        if (!response.data || !response.data.days) { 
            return responses.notFound(res, 'Failed to fetch weather forecast');
        }
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
        const { error1, value } = schemas.daily.validate(req.query);
        if (error1) return responses.badRequest(res, error1.message);
        // location is in params and the rest are in query
        const { error2, value: {location} } = locationAndMetricSchema.validate(req.params);
        if (error2) return responses.badRequest(res, error2.message);
        const { days, unit } = value;
        const cacheKey = `forecast:daily:${location}:${unit}:${days}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log('Cache hit!');
            return responses.success(res, "daily forecast fetched",JSON.parse(cachedData));
        }

        console.log('Cache miss. Fetching data from Visual Crossing API...');
        const apiKey = process.env.VISUAL_CROSSING_API_KEY;
        const apiUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${location}?unitGroup=${unit}&key=${apiKey}&include=days&elements=datetime,tempmax,tempmin,conditions,windspeed&days=${days}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }

        const data = await response.json();

        const forecast = data.days.slice(0, days).map((day) => ({
            date: day.datetime,
            high_temp: day.tempmax,
            low_temp: day.tempmin,
            condition: day.conditions,
            wind_speed: day.windspeed,
        }));

        // Cache the response in Redis for 1 hour
        await redisClient.set(cacheKey, JSON.stringify(forecast), 'EX', 3600);

        // forecast = { location: data.resolvedAddress, forecast };
        return responses.success(res, 'Daily weather forecast retrieved successfully', forecast);
    } catch (error) {
        console.error('Error fetching daily forecast:', error);
        return responses.internalServerError(res, 'Internal Server Error', 500);
    }
};

const hourlyForecast = async (req, res) => {
    console.log('Fetching hourly forecast...');
    try {
        const { error1, value } = schemas.hourly.validate(req.query);
        if (error1) return responses.badRequest(res, error1.message);
        // location is in params and the rest are in query
        const { error2, value: {location} } = locationAndMetricSchema.validate(req.params);
        if (error2) return responses.badRequest(res, error2.message);
        const { hours, unit } = value;
        const cacheKey = `hourly:${location}:${unit}:${hours}`;
    
        // Check if the data is in Redis cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          console.log('Cache hit!');
          return res.json(JSON.parse(cachedData));
        }
    
        // Construct the Visual Crossing API URL
        const apiKey = process.env.VISUAL_CROSSING_API_KEY;
        const apiUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${location}?unitGroup=${unit}&include=hours&key=${apiKey}`;
    
        // Fetch data from Visual Crossing API
        const response = await fetch(apiUrl);
        if (!response.ok) {
          return responses.notFound(res, 'Error fetching data from Visual Crossing API' );
        }
    
        const weatherData = await response.json();
        const currentHour = new Date().getHours();
        const hourlyForecast = weatherData.days[0].hours
        .filter((hour) => {
            const hourTime = parseInt(hour.datetime.split(':')[0], 10); // Extract hour from "HH:mm" format
            return hourTime >= currentHour;
        })
        .slice(0, hours) // Limit the results to the specified number of hours
        .map(hour => ({
            time: hour.datetime,
            temperature: hour.temp,
            condition: hour.conditions,
            humidity: hour.humidity,
            wind_speed: hour.windspeed
        }));
    
        const result = {
          location,
          forecast: hourlyForecast
        };
    
        await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    
        return responses.success(res, "data fetched successfully", result);
    
    } catch (error) {
        console.error(error);
        return responses.internalServerError(res, 'Internal Server Error');
    }
};

const forecastServices = {
    forecastByLocation,
    dailyForecast,
    hourlyForecast,
};

export default forecastServices;
