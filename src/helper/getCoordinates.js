import axios from 'axios';

async function getCoordinates(location) {
    const geoApiUrl = `http://api.openweathermap.org/geo/1.0/direct`;

    try {
        const response = await axios.get(geoApiUrl, {
            params: {
                q: location,
                limit: 1,
                appid: process.env.AIR_QUALITY_API_KEY,
            },
        });

        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { lat, lon };
        } else {
            throw new Error(`Location "${location}" not found.`);
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error.message);
        throw new Error('Failed to get coordinates.');
    }
}

export default getCoordinates;