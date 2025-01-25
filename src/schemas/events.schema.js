import Joi from 'joi';

const eventSchema = Joi.object({
    location: Joi.string().required().messages({
        'string.base': '"location" should be a type of \'string\'',
        'string.empty': '"location" cannot be an empty field',
        'any.required': '"location" is a required field'
    }),
    startDate: Joi.date().iso().required().messages({
        'date.base': '"startDate" should be a valid ISO date string',
        'any.required': '"startDate" is a required field'
    }),
    endDate: Joi.date().iso().required().greater(Joi.ref('startDate')).messages({
        'date.base': '"endDate" should be a valid ISO date string',
        'any.required': '"endDate" is a required field',
        'date.greater': '"endDate" should be greater than "startDate"'
    }),
    preferences: Joi.object({
        temperatureRange: Joi.object({
            min: Joi.number().required().messages({
                'number.base': '"temperatureRange.min" should be a type of \'number\'',
                'any.required': '"temperatureRange.min" is required'
            }),
            max: Joi.number().required().messages({
                'number.base': '"temperatureRange.max" should be a type of \'number\'',
                'any.required': '"temperatureRange.max" is required'
            })
        }).required().messages({
            'object.base': '"preferences.temperatureRange" should be an object',
            'any.required': '"preferences.temperatureRange" is a required field'
        }),
        noRain: Joi.boolean().required().messages({
            'boolean.base': '"preferences.noRain" should be a type of \'boolean\'',
            'any.required': '"preferences.noRain" is a required field'
        })
    }).required().messages({
        'object.base': '"preferences" should be an object',
        'any.required': '"preferences" is a required field'
    })
});

export default eventSchema;