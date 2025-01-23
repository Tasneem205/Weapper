import Joi from 'joi';

// Define the validation schema
const daily = Joi.object({
  location: Joi.string().required(),
  days: Joi.number().min(1).max(15).default(7), // Default to 7 days if not provided 
});

const houly = Joi.object({
  location: Joi.string().required(),
  hours: Joi.number().min(1).max(24).default(24), // Default to 24 hours if not provided
});

const schemas = {
    daily,
    houly,
};
export default schemas;