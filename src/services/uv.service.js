import responses from "../helper/responses.js";
import axios from "axios";
import locationAndMetricSchema from "../schemas/locations.schema.js";

const getUVIndex = async (req, res) => {
    try {
        const { error, value } = locationAndMetricSchema.validate(req.query);
        if (error) return responses.badRequest(res, `Validation error: ${error.message}`);
        const { location, unit } = value;

        // Fetch weather data from Visual Crossing API
        const APIresponse = await axios.get(
            `${process.env.VISUAL_CROSSING_BASE_URL}/${encodeURIComponent(location)}`,
            {
                params: {
                    key: process.env.VISUAL_CROSSING_API_KEY,
                    include: "current", // Include only current conditions
                    unitGroup: unit,
                },
            }
        );

        if (!APIresponse || !APIresponse.data || !APIresponse.data.currentConditions) {
            return responses.notFound(res, "UV index data not found for the specified location.");
        }

        const uvIndex = APIresponse.data.currentConditions.uvindex;
        let riskLevel;
        if (uvIndex <= 2) {
            riskLevel = "Low";
        } else if (uvIndex <= 5) {
            riskLevel = "Moderate";
        } else if (uvIndex <= 7) {
            riskLevel = "High";
        } else if (uvIndex <= 10) {
            riskLevel = "Very High";
        } else {
            riskLevel = "Extreme";
        }

        // Prepare response data
        const responseData = {
            location: APIresponse.data.resolvedAddress || location,
            uv_index: uvIndex,
            risk_level: riskLevel,
        };

        return responses.success(res, "UV index data fetched successfully", responseData);
    } catch (error) {
        console.log(`Failed to fetch UV index data:\n${error}`);
        return responses.internalServerError(res, "An error occurred while fetching UV index data.");
    }
};

export default getUVIndex;