import Joi from 'joi';

const settingSchema = Joi.object({
    theme: Joi.string().valid('light', 'dark'),
    notifications: Joi.boolean(),
});

export default settingSchema;