import axios from "axios";
import responses from "../helper/responses.js";
import travelPlannerSchema from "../schemas/travelPlanner.schema.js"

const getAgricultureWeather = async (req, res) => {
    try {
        const { error, value } = travelPlannerSchema.validate(req.body);
        if (error) return responses.badRequest(res, error.details);
    
        const location = value.destination;
        const { unit, startDate, endDate } = value;
        if (!endDate) return responses.badRequest(res, 'End date is required.');
        // Construct API URL
        const apiKey = process.env.VISUAL_CROSSING_API_KEY;
        const baseUrl = process.env.VISUAL_CROSSING_BASE_URL;
        const apiUrl = `${baseUrl}/${encodeURIComponent(location)}/${startDate.toISOString().split("T")[0]}/${endDate.toISOString().split("T")[0]}?unitGroup=${unit}&include=days&key=${apiKey}`;
        console.log(apiUrl);
        // Fetch data from Visual Crossing API
        const APIresponse = await axios.get(apiUrl);
    
        if (!APIresponse || !APIresponse.data || !APIresponse.data.days) {
            return notFound(res, 'Weather data not found for the specified location or date range.');
        }
    
        // Process API response
        const days = APIresponse.data.days;
        const precipitation = days.map(day => ({
            date: day.datetime,
            mm: day.precip || 0,
        }));
        const totalTemp = days.reduce((acc, day) => acc + day.temp, 0);
        const averageTemperature = (totalTemp / days.length).toFixed(1);
    
        const totalPrecipitation = precipitation.reduce((acc, day) => acc + day.mm, 0);
        const recommendation =
            totalPrecipitation < 10
            ? 'Irrigation needed for the upcoming week due to low rainfall.'
            : 'Rainfall is sufficient; irrigation may not be required.';
    
        // Send response
        return responses.success(res, {
            location: APIresponse.data.address,
            precipitation,
            averageTemperature: Number(averageTemperature),
            recommendation,
        });
    } catch (error) {
        console.error(`Error fetching agriculture weather data: ${error.message}`);
        return responses.internalServerError(res, error.message);
    }
};

export default getAgricultureWeather;