import Joi from 'joi';

const travelPlannerSchema = Joi.object({
    destination: Joi.string().required(),
    unit: Joi.string()
      .valid('metric', 'us', 'uk', 'ca')
      .default('metric'),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
});

export default travelPlannerSchema;