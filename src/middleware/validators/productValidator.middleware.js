const Joi = require("joi");

exports.productSchemas = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(50).label("Product name"),

    narx: Joi.number().min(0).required().label("Price"),

    qoldiq: Joi.number().min(0).required().label("Stock"),

    unit_id: Joi.number().integer().required().label("Unit ID"),

    sklad1_qoldiq: Joi.number().min(0).required().label("Sklad 1 qoldiq"),

    sklad2_qoldiq: Joi.number().min(0).required().label("Sklad 2 qoldiq"),

    min_amount1: Joi.number().min(0).required().label("Minimal miqdor 1"),

    min_amount2: Joi.number().min(0).required().label("Minimal miqdor 2"),
  }),

  update: Joi.object({
    name: Joi.string().required().min(2).max(50).label("Product name"),

    narx: Joi.number().min(0).required().label("Price"),

    qoldiq: Joi.number().min(0).required().label("Stock"),

    unit_id: Joi.number().integer().required().label("Unit ID"),

    sklad1_qoldiq: Joi.number().min(0).required().label("Sklad 1 qoldiq"),

    sklad2_qoldiq: Joi.number().min(0).required().label("Sklad 2 qoldiq"),

    min_amount1: Joi.number().min(0).required().label("Minimal miqdor 1"),

    min_amount2: Joi.number().min(0).required().label("Minimal miqdor 2"),
  }),
};
