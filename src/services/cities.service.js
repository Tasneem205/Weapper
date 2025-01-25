import responses from "../helper/responses.js";

const getSupportedCities = async (req, res) => {
    try {
        // Predefined list of supported cities
        // should be saved in the database first then fetched from there
        const cities = [
            "New York",
            "London",
            "Paris",
            "Tokyo",
            "Los Angeles",
            "Sydney"
        ];

        return responses.success(res, "Supported cities fetched successfully", { cities });
    } catch (error) {
        console.log(`Failed to fetch supported cities: ${error}`);
        return responses.internalServerError(res);
    }
};

export default getSupportedCities;
