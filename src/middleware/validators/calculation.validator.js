const Joi = require("joi");

exports.CaclulationSchema = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(100).label("Template Name"),

    total_spent: Joi.number().min(0).required().label("Total Spent"),

    selling_price: Joi.number().min(0).required().label("Selling Price"),

    qoldiq: Joi.number().required().label("Stock"),

    sklad1_qoldiq: Joi.number().min(0).required().label("Sklad1 Stock"),
    sklad2_qoldiq: Joi.number().min(0).required().label("Sklad2 Stock"),
    bishish_qoldiq: Joi.number().min(0).required().label("Boiling Stock"),
    averlo_qoldiq: Joi.number().min(0).required().label("Overlock Stock"),
    dazmol_qoldiq: Joi.number().min(0).required().label("Ironing Stock"),

    ingredients: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.number().integer().required().label("Product ID"),
          miqdor: Joi.number().min(0).required().label("Quantity"),
          summa: Joi.number().min(0).required().label("Line Total"),
        })
      )
      .min(1)
      .required()
      .label("Ingredients"),
  }),

  update: Joi.object({
    name: Joi.string().required().min(2).max(100).label("Template Name"),

    total_spent: Joi.number().min(0).required().label("Total Spent"),

    selling_price: Joi.number().min(0).required().label("Selling Price"),

    qoldiq: Joi.number().required().label("Stock"),

    sklad1_qoldiq: Joi.number().min(0).required().label("Sklad1 Stock"),
    sklad2_qoldiq: Joi.number().min(0).required().label("Sklad2 Stock"),
    bishish_qoldiq: Joi.number().min(0).required().label("Boiling Stock"),
    averlo_qoldiq: Joi.number().min(0).required().label("Overlock Stock"),
    dazmol_qoldiq: Joi.number().min(0).required().label("Ironing Stock"),

    ingredients: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.number().integer().required().label("Product ID"),
          miqdor: Joi.number().min(0).required().label("Quantity"),
          summa: Joi.number().min(0).required().label("Line Total"),
        })
      )
      .min(1)
      .required()
      .label("Ingredients"),
  }),
};
