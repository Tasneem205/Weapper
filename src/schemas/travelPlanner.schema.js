import Joi from 'joi';

const travelPlannerSchema = Joi.object({
    destination: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
});

export default travelPlannerSchema;