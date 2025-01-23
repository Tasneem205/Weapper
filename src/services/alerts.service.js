import responses from '../helper/responses.js';
import axios from 'axios';
import redisClient from '../middleWares/redisClient.js';
import locationAndMetricSchema from '../schemas/locations.schema.js';

const getAlerts = async (req, res) => {
    try {
        const { error, value } = locationAndMetricSchema.validate(req.params);
        if (error) return responses.badRequest(res, error.message);
        const {location, unit} = value;

        const apiKey = process.env.VISUAL_CROSSING_API_KEY;
        const apiUrl = `${process.env.VISUAL_CROSSING_BASE_URL}/${location}?unitGroup=${unit}&include=alerts&key=${apiKey}`;
        const response = await axios.get(apiUrl);

        if (!response.data.alerts || response.data.alerts.length === 0) {
            return responses.success(res, 'No active weather alerts.', {
                location,
                alerts: [],
            });
        }

        const alerts = response.data.alerts.map((alert) => ({
            alert_type: alert.event,
            description: alert.description,
            start_time: alert.onset,
            end_time: alert.expires,
        }));

        return responses.success(res, 'Active weather alerts retrieved successfully.', {
            location,
            alerts,
        });
    } catch (error) {
        console.error('Error fetching weather alerts:', error.message);
        return responses.internalServerError(res, 'Failed to fetch weather alerts.');
    }
};

export default getAlerts;