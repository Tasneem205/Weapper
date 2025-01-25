import responses from "../helper/responses.js";
import axios from "axios";
import travelPlannerSchema from "../schemas/travelPlanner.schema.js";
import getNextDay from "../helper/nextDay.js";

const travelPlannerForecast = async (req, res) => {
    try {
        const { error, value } = travelPlannerSchema.validate(req.body);
        if (error) return responses.badRequest(res, `Validation error: ${error.message}`);
        const { startDate, destination } = value;
        const endDate = value.endDate || getNextDay(startDate);
        const apiKey = process.env.VISUAL_CROSSING_API_KEY;
        const apiURL = `${process.env.VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(destination)}/${startDate.toISOString().split("T")[0]}/${endDate}?key=${apiKey}`;
        // Fetch forecast data from Visual Crossing API
        
        const APIresponse = await axios.get(apiURL);

        // Validate response
        if (!APIresponse || !APIresponse.data || !APIresponse.data.days) {
            return responses.notFound(res, "Weather data not found for the specified destination and dates.");
        }

        // Process the weather forecast data
        const forecast = APIresponse.data.days.map(day => ({
            date: day.datetime,
            temp: day.temp,
            condition: day.conditions,
        }));

        // Generate a recommendation based on the forecast
        let recommendation = "Pack accordingly.";
        const hasRain = forecast.some(day => day.condition.toLowerCase().includes("rain"));
        const isCold = forecast.some(day => day.temp <= 10);
        if (hasRain && isCold) {
            recommendation = "Pack an umbrella, warm clothing, and waterproof boots for rain and cold weather.";
        } else if (hasRain) {
            recommendation = "Pack an umbrella for rainy weather.";
        } else if (isCold) {
            recommendation = "Pack warm clothing for cold weather.";
        } else {
            recommendation = "Pack light clothing for comfortable weather.";
        }

        // Prepare response data
        const responseData = {
            destination,
            forecast,
            recommendation,
        };

        return responses.success(res, "Travel planner data fetched successfully", responseData);
    } catch (error) {
        console.log(`Failed to fetch travel planner data:\n${error}`);
        return responses.internalServerError(res, "An error occurred while fetching travel planner data.");
    }
};

export default travelPlannerForecast;
