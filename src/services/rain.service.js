import responses from "../helper/responses.js";
import redisClient from "../middleWares/redisClient.js";
import axios from "axios";
import locationAndMetricSchema from "../schemas/locations.schema.js";

const getNextDay = (date) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

const getRainChance = async (req, res) => {
    try {
        const { error, value: {location, unit, date} } = locationAndMetricSchema.validate(req.query);
        const stringDate = date.toISOString().split('T')[0];
        if (error) return responses.badRequest(res, `Validation error\n ${error}`);

        // Check cache in Redis
        const cacheKey = `rain_chance:${location}:${date}:${unit}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log("Cache hit!");
            return responses.success(res, "Rain chance fetched successfully", JSON.parse(cachedData));
        }

        console.log("Cache miss! Fetching from Visual Crossing API...");
        const nextDay = getNextDay(date);
        const apiKey = process.env.VISUAL_CROSSING_API_KEY;
        const apiUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${location}/${stringDate}/${nextDay}?unitGroup=${unit}&key=${apiKey}`;
        const APIresponse = await axios.get(apiUrl);

        if (!APIresponse || !APIresponse.data || !APIresponse.data.days) {
            return responses.notFound(res, "Data not found for the specified location.");
        }
        const rainChance = APIresponse.data.days[0].precipprob || 0;

        const responsePayload = {
            location: APIresponse.data.resolvedAddress,
            date: date,
            rain_chance: rainChance,
        };

        // Save to cache
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(responsePayload));

        return responses.success(res, "Rain chance fetched successfully", responsePayload);
    } catch (error) {
        console.log(`Failed to fetch rain chance: ${error}`);
        return responses.internalServerError(res);
    }
};

export default getRainChance;
