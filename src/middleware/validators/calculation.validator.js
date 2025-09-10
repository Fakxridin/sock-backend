// middleware/validators/calculation.validator.js
const Joi = require("joi");

// Bitta ingredient item sxemasi
const ingredientItem = Joi.object({
  product_id: Joi.number().integer().required().label("Product ID"),
  miqdor: Joi.number().min(0).required().label("Quantity"),
  summa: Joi.number().min(0).required().label("Line Total"),
});

// ingredients: array YOKI string(JSON)
const ingredientsField = Joi.alternatives()
  .try(
    Joi.array().items(ingredientItem), // to'g'ridan-to'g'ri array kelsa
    Joi.string().custom((v, helpers) => {
      try {
        const parsed = JSON.parse(v);
        if (!Array.isArray(parsed)) return helpers.error("any.invalid");
        // ichki elementlarni ham tekshiramiz
        const { error } = Joi.array().items(ingredientItem).validate(parsed);
        if (error) return helpers.error("any.invalid");
        return parsed; // ✅ value array bo'lib controllerga boradi
      } catch {
        return helpers.error("any.invalid");
      }
    }, "JSON parse for ingredients")
  )
  .label("Ingredients");

// DRY: umumiy raqam maydonlari
const numericCommon = {
  kurs_summa: Joi.number().min(0).required().label("Kurs summa"),

  total_spent: Joi.number().min(0).required().label("Total Spent"), // USD
  selling_price: Joi.number().min(0).required().label("Selling Price"), // USD

  total_spent_som: Joi.number().min(0).required().label("Total Spent Som"),
  selling_price_som: Joi.number().min(0).required().label("Selling Price Som"),

  qoldiq: Joi.number().required().label("Stock"),
  sklad1_qoldiq: Joi.number().min(0).required().label("Sklad1 Stock"),
  sklad2_qoldiq: Joi.number().min(0).required().label("Sklad2 Stock"),
  bishish_qoldiq: Joi.number().min(0).required().label("Boiling Stock"),
  averlo_qoldiq: Joi.number().min(0).required().label("Overlock Stock"),
  dazmol_qoldiq: Joi.number().min(0).required().label("Ironing Stock"),
  etiketika_qoldiq: Joi.number().min(0).required().label("etiketika_qoldiq"),
};

exports.CaclulationSchema = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(100).label("Template Name"),
    ...numericCommon,
    ingredients: ingredientsField.required(),
    // Agar xohlasangiz:
    // img_name: Joi.any().optional(), // multer bilan file keladi (req.file)
  }),

  update: Joi.object({
    name: Joi.string().required().min(2).max(100).label("Template Name"),
    ...numericCommon,
    ingredients: ingredientsField.required(),
    // img_name: Joi.any().optional(),
  }),
};
