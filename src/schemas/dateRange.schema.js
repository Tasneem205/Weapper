import Joi from "joi";

const locationAndDateRangeSchema = Joi.object({
    location: Joi.string().required(),
    dateRange: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      "string.pattern.base": "dateRange must be in the format 'YYYY-MM-DD:YYYY-MM-DD'.",
    }),
});

export default locationAndDateRangeSchema;
