const Joi = require('joi');

exports.unitSchemas = {
    create: Joi.object({
        name: Joi.string()
            .required()
            .min(2)
            .max(30)
            .label('Olchov birligi'),
    }),

    update: Joi.object({
        name: Joi.string()
            .required()
            .min(2)
            .max(30)
            .label('Olchov birligi'),
    }),
};
