const Joi = require('joi');

exports.kontragentSchemas = {
    create: Joi.object({
        fullname: Joi.string().min(2).max(100).required().label('To‘liq ism'),
        phone_number: Joi.string().allow(null, '').label('Telefon raqam'),
        comment: Joi.string().allow(null, '').label('Izoh'),
        balance: Joi.number().label('Balans')
    }),

    update: Joi.object({
        fullname: Joi.string().min(2).max(100).required().label('To‘liq ism'),
        phone_number: Joi.string().allow(null, '').label('Telefon raqam'),
        comment: Joi.string().allow(null, '').label('Izoh'),
        balance: Joi.number().label('Balans')
    })
};