const FoodShablonModel = require("../models/calculation.model");
const NeededProductModel = require("../models/needed-product.model");
const ProductModel = require("../models/product.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

class FoodShablonController extends BaseController {
  // 🔹 Get all templates
  getAll = async (req, res, next) => {
    const shablons = await FoodShablonModel.findAll({
      include: [
        { model: NeededProductModel, as: "ingredients", include: ["product"] },
      ],
      order: [["name", "ASC"]],
    });

    const formatted = shablons.map((s) => {
      const json = s.toJSON();
      return {
        id: json.id,
        name: json.name,
        total_spent: json.total_spent,
        total_spent_som: json.total_spent_som,
        selling_price_som: json.selling_price_som,
        kurs_summa: json.kurs_summa,
        selling_price: json.selling_price,
        qoldiq: json.qoldiq,
        sklad1_qoldiq: json.sklad1_qoldiq,
        sklad2_qoldiq: json.sklad2_qoldiq,
        bishish_qoldiq: json.bishish_qoldiq,
        averlo_qoldiq: json.averlo_qoldiq,
        dazmol_qoldiq: json.dazmol_qoldiq,
        ingredients: json.ingredients,
      };
    });

    res.send(formatted);
  };

  // 🔹 Get one by ID
  getById = async (req, res, next) => {
    const shablon = await FoodShablonModel.findByPk(req.params.id, {
      include: [
        { model: NeededProductModel, as: "ingredients", include: ["product"] },
      ],
    });

    if (!shablon) throw new HttpException(404, req.mf("data not found"));

    const json = shablon.toJSON();
    res.send({
      id: json.id,
      name: json.name,
      total_spent_som: json.total_spent_som,
      selling_price_som: json.selling_price_som,
      kurs_summa: json.kurs_summa,
      total_spent: json.total_spent,
      selling_price: json.selling_price,
      qoldiq: json.qoldiq,
      sklad1_qoldiq: json.sklad1_qoldiq,
      sklad2_qoldiq: json.sklad2_qoldiq,
      bishish_qoldiq: json.bishish_qoldiq,
      averlo_qoldiq: json.averlo_qoldiq,
      dazmol_qoldiq: json.dazmol_qoldiq,
      ingredients: json.ingredients,
    });
  };

  // 🔹 Create
  create = async (req, res, next) => {
    this.checkValidation(req);

    const {
      name,
      selling_price,
      qoldiq,
      total_spent_som,
      selling_price_som,
      kurs_summa,
      sklad1_qoldiq = 0,
      sklad2_qoldiq = 0,
      bishish_qoldiq = 0,
      averlo_qoldiq = 0,
      dazmol_qoldiq = 0,
      ingredients,
    } = req.body;

    const total_spent = ingredients.reduce((acc, i) => {
      return acc + Number(i.summa);
    }, 0);

    const shablon = await FoodShablonModel.create({
      name,
      total_spent,
      selling_price,
      qoldiq,
      total_spent_som,
      selling_price_som,
      kurs_summa,
      sklad1_qoldiq,
      sklad2_qoldiq,
      bishish_qoldiq,
      averlo_qoldiq,
      dazmol_qoldiq,
    });

    if (!shablon) throw new HttpException(500, req.mf("Something went wrong"));

    const items = ingredients.map((i) => ({
      food_shablon_id: shablon.id,
      product_id: i.product_id,
      miqdor: i.miqdor,
      summa: i.summa,
    }));
    await NeededProductModel.bulkCreate(items);

    req.params.id = shablon.id;
    return this.getById(req, res, next);
  };

  // 🔹 Update
  update = async (req, res, next) => {
    this.checkValidation(req);

    const shablon = await FoodShablonModel.findByPk(req.params.id);
    if (!shablon) throw new HttpException(404, req.mf("data not found"));

    const {
      name,
      selling_price,
      qoldiq,
      total_spent_som,
      selling_price_som,
      kurs_summa,
      sklad1_qoldiq = 0,
      sklad2_qoldiq = 0,
      bishish_qoldiq = 0,
      averlo_qoldiq = 0,
      dazmol_qoldiq = 0,
      ingredients,
    } = req.body;

    const total_spent = ingredients?.reduce((acc, i) => {
      return acc + Number(i.summa);
    }, 0);

    Object.assign(shablon, {
      name,
      total_spent,
      selling_price,
      total_spent_som,
      selling_price_som,
      kurs_summa,
      qoldiq,
      sklad1_qoldiq,
      sklad2_qoldiq,
      bishish_qoldiq,
      averlo_qoldiq,
      dazmol_qoldiq,
    });

    await shablon.save();

    if (ingredients) {
      await NeededProductModel.destroy({
        where: { food_shablon_id: shablon.id },
      });

      const items = ingredients.map((i) => ({
        food_shablon_id: shablon.id,
        product_id: i.product_id,
        miqdor: i.miqdor,
        summa: i.summa,
      }));
      await NeededProductModel.bulkCreate(items);
    }

    return this.getById(req, res, next);
  };

  // 🔹 Delete
  delete = async (req, res, next) => {
    const shablon = await FoodShablonModel.findByPk(req.params.id);
    if (!shablon) throw new HttpException(404, req.mf("data not found"));

    await shablon.destroy();
    res.send(req.mf("data has been deleted"));
  };
  // 🔹 Get ingredients by shablon_id with sklad2_qoldiq
  // 🔹 Get ingredients by shablon_id with sklad2_qoldiq
  // 🔹 Get ingredients by shablon_id with sklad2_qoldiq
  // 🔹 Get ingredients by shablon_id with product sklad2_qoldiq
  getIngredientsByShablonId = async (req, res, next) => {
    const { shablon_id } = req.params;
    try {
      const shablon = await FoodShablonModel.findByPk(shablon_id, {
        include: [
          {
            model: NeededProductModel,
            as: "ingredients",
            include: [
              {
                model: ProductModel,
                as: "product",
                attributes: ["id", "name", "sklad2_qoldiq"], // add sklad2_qoldiq to the attributes
              },
            ],
          },
        ],
      });

      if (!shablon) {
        return next(new HttpException(404, "Shablon topilmadi"));
      }

      // Mapping ingredients with product data
      const ingredients = shablon.ingredients.map((ing) => ({
        product_id: ing.product_id,
        product_name: ing.product.name, // Product name
        miqdor: ing.miqdor,
        summa: ing.summa,
        sklad2_qoldiq: ing.product.sklad2_qoldiq,
      }));

      res.send({
        shablon_id: shablon.id,
        name: shablon.name,
        ingredients,
      });
    } catch (error) {
      next(new HttpException(500, "Shablonni yuklashda xatolik yuz berdi"));
    }
  };
}

module.exports = new FoodShablonController();
