import Joi from 'joi';

// Define the validation schema
const locationAndMetricSchema = Joi.object({
  location: Joi.string().required(), // Location is required and must be a string
  unit: Joi.string()
    .valid('metric', 'us', 'uk', 'ca') // Accept only these values
    .default('metric'), // Default to 'metric' if not provided
  date: Joi.date().iso()
    .default(() => new Date().toISOString().split('T')[0]),
});

export default locationAndMetricSchema;