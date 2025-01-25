import Joi from 'joi';

const userSchema = Joi.object({
    user_id: Joi.string().required(),
});

export default userSchema;