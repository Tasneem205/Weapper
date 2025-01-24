import Joi from 'joi';

const userSchema = Joi.object({
    user_id: Joi.string().required(),
    theme: Joi.string().valid('light', 'dark'),
    notifications: Joi.boolean(),
});

export default userSchema;