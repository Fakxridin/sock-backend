const Joi = require("joi");

const prixodSchemas = {
  create: Joi.object({
    datetime: Joi.number().required().label("Date Time"),
    total_overall_cost: Joi.number().min(0).required().label("Total Cost"),
    rasxod_summa: Joi.number().min(0).optional().label("Rasxod Summa"), // Optional in creation
    comment: Joi.string().allow("", null),
    prixod_table: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.number().integer().required(),
          kontragent_id: Joi.number().integer().required(),
          miqdor: Joi.number().min(0).required(),
          product_cost: Joi.number().min(0).required(),
          initial_cost: Joi.number().min(0).optional().default(0),
          total_cost: Joi.number().min(0).required(),
        })
      )
      .min(1)
      .required(),
  }),

  update: Joi.object({
    datetime: Joi.number().required().label("Date Time"),
    total_overall_cost: Joi.number().min(0).required().label("Total Cost"),
    rasxod_summa: Joi.number().min(0).optional().label("Rasxod Summa"), // Optional in update
    comment: Joi.string().allow("", null),
    prixod_table: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().integer().optional(),
          product_id: Joi.number().integer().required(),
          kontragent_id: Joi.number().integer().required(),
          miqdor: Joi.number().min(0).required(),
          product_cost: Joi.number().min(0).required(),
          initial_cost: Joi.number().min(0).optional().default(0),
          total_cost: Joi.number().min(0).required(),
        })
      )
      .min(1)
      .required(),
  }),
};

module.exports = { prixodSchemas };
