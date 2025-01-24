import axios from 'axios';
import redisClient from '../middleWares/redisClient.js';
import responses from '../helper/responses.js';
import historicalSchema from '../schemas/history.schema.js';
import locationAndMetricSchema from '../schemas/locations.schema.js';

const getHistoricalWeather = async (req, res) => {
    try {
        const { error2, value: {location} } = locationAndMetricSchema.validate(req.params);
        if (error2) return responses.badRequest(res, error2.message);
        const { error1, value } = historicalSchema.validate(req.query);
        if (error1) return responses.badRequest(res, error1.message);

        const { start_date, end_date, unit } = value;
        const cacheKey = `historical:${location}:${start_date}:${end_date}:${unit}`;

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit for historical weather!');
            return responses.success(res, "data fetched from cache", JSON.parse(cachedData));
        }

        const apiKey = process.env.VISUAL_CROSSING_API_KEY;
        const apiUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${location}/${start_date}/${end_date}?unitGroup=${unit}&key=${apiKey}`;

        const response = await axios.get(apiUrl);

        const historicalData = response.data.days.map((day) => ({
            date: day.datetime,
            temperature: day.temp,
            condition: day.conditions,
            humidity: day.humidity,
            wind_speed: day.windspeed,
        }));

        const result = {
            location,
            length: historicalData.length,
            historical_data: historicalData,
        };

        await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600); // Cache for 1 hour

        return responses.success(res, 'Historical data fetched successfully', result);
    } catch (error) {
        console.error(error);
        if (error.response) {
            return responses.notFound(res, `Error fetching data: ${error.response.statusText}`);
        }
        return responses.internalServerError(res, 'Internal Server Error');
    }
};

export default getHistoricalWeather;