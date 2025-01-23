import Joi from 'joi';

// Define the validation schema
const daily = Joi.object({
  days: Joi.number().min(1).max(15).default(7), // Default to 7 days if not provided 
  unit: Joi.string()
    .valid('metric', 'us', 'uk', 'ca') // Accept only these values
    .default('metric'), // Default to 'metric' if not provided
});

const hourly = Joi.object({
  hours: Joi.number().min(1).max(24).default(24), // Default to 24 hours if not provided
  unit: Joi.string()
    .valid('metric', 'us', 'uk', 'ca') // Accept only these values
    .default('metric'), // Default to 'metric' if not provided
});

const schemas = {
    daily,
    hourly,
};
export default schemas;