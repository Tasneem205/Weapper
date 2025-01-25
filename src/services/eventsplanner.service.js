import responses from "../helper/responses.js";
import axios from "axios";
import redisClient from '../middleWares/redisClient.js';
import eventSchema from "../schemas/events.schema.js";

const eventPlanner = async (req, res) => {
    try {
        const { error, value } = eventSchema.validate(req.body);
        if (error) {
            return responses.badRequest(res, 'Invalid request body', error.details);
        }

        const { location, startDate, endDate, preferences } = value;
        const { temperatureRange, noRain } = preferences;

        const cacheKey = `eventPlanner:${location}:${startDate.toISOString().split("T")[0]}:${endDate.toISOString().split("T")[0]}:${JSON.stringify(preferences)}`;
        const cachedData = await redisClient.get(cacheKey);

        // if (cachedData) {
        //     console.log(`Cache hit for key: ${cacheKey}`);
        //     return responses.success(res, JSON.parse(cachedData));
        // }

        console.log(`Cache miss for key: ${cacheKey}`);

        // Fetch weather forecast for the specified range
        const visualCrossingUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(location)}?startDate=${startDate.toISOString().split("T")[0]}T00:00:00&endDate=${endDate.toISOString().split("T")[0]}T00:00:00&unitGroup=metric&key=${process.env.VISUAL_CROSSING_API_KEY}`;
        console.log(visualCrossingUrl);
        const weatherResponse = await axios.get(visualCrossingUrl);

        if (!weatherResponse || !weatherResponse.data || !weatherResponse.data.days) {
            return responses.notFound(res, 'Weather data not found for the specified location.');
        }

        // Filter and collect optimal dates based on preferences
        const optimalDates = [];
        const eventDetails = [];
        // console.log(weatherResponse.data.days[0]);
        for (const day of weatherResponse.data.days) {
            // console.log(day);
            const date = day.datetime;
            const temp = day.temp;
            const condition = day.conditions;
            console.log(date, temp, condition);
            // Check if temperature is within range
            const isTemperatureSuitable = temp >= temperatureRange.min && temp <= temperatureRange.max;

            // Check if no rain is preferred and the weather condition is not rainy
            const isRainFree = noRain ? !condition.toLowerCase().includes('rain') : true;

            // If the day matches the preferences, consider it an optimal date
            if (isTemperatureSuitable && isRainFree) {
                optimalDates.push(date);
                eventDetails.push({ date, temp, condition });
            }
        }

        // If no optimal dates found, return a message
        if (optimalDates.length === 0) {
            return responses.success(res, {
                location,
                optimalDates: [],
                details: [],
                message: 'No suitable dates found based on your preferences.'
            });
        }

        const responseData = {
            location,
            optimalDates,
            details: eventDetails,
        };

        // Store the result in Redis for 1 hour
        await redisClient.set(cacheKey, JSON.stringify(responseData), 'EX', 3600);

        // Send the response
        return responses.success(res, responseData);

    } catch (error) {
        console.error(`Error fetching event planner data: ${error.message}`);
        return responses.internalServerError(res, 'Internal Server Error', error.message);
    }
};

export default eventPlanner;
