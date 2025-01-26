import Joi from 'joi';

const seasonalTrendsSchema = Joi.object({
    location: Joi.string().required(),
    season: Joi.string().valid('spring', 'summer', 'fall', 'winter', 'autumn').required(),
});

export default seasonalTrendsSchema;