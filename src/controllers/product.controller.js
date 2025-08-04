const ProductModel = require("../models/product.model");
const UnitModel = require("../models/unit.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

/******************************************************************************
 *                            Product Controller
 ******************************************************************************/
class ProductController extends BaseController {
  getAll = async (req, res, next) => {
    const products = await ProductModel.findAll({
      include: [
        {
          model: UnitModel,
          as: "unit",
          attributes: ["name"],
        },
      ],
      order: [["name", "ASC"]],
    });

    // Format response to include unit_name at the same level as other fields
    const formatted = products.map((p) => {
      const json = p.toJSON();
      const {
        id,
        name,
        narx,
        qoldiq,
        unit_id,
        sklad1_qoldiq,
        sklad2_qoldiq,
        min_amount1,
        min_amount2,
      } = json;
      return {
        id,
        name,
        narx,
        qoldiq,
        unit_id,
        unit_name: json.unit?.name || null,
        sklad1_qoldiq,
        sklad2_qoldiq,
        min_amount1,
        min_amount2,
      };
    });

    res.send(formatted);
  };

  getById = async (req, res, next) => {
    const product = await ProductModel.findOne({
      where: { id: req.params.id },
      include: [{ model: UnitModel, as: "unit" }],
    });

    if (!product) {
      throw new HttpException(404, req.mf("data not found"));
    }

    res.send(product);
  };

  create = async (req, res, next) => {
    this.checkValidation(req);

    const {
      name,
      narx,
      qoldiq,
      unit_id,
      sklad1_qoldiq,
      sklad2_qoldiq,
      min_amount1,
      min_amount2,
    } = req.body;

    const product = await ProductModel.create({
      name,
      narx,
      qoldiq,
      unit_id,
      sklad1_qoldiq,
      sklad2_qoldiq,
      min_amount1,
      min_amount2,
    });

    if (!product) {
      throw new HttpException(500, req.mf("Something went wrong"));
    }

    res.status(201).send(product);
  };

  update = async (req, res, next) => {
    this.checkValidation(req);

    const product = await ProductModel.findOne({
      where: { id: req.params.id },
    });

    if (!product) {
      throw new HttpException(404, req.mf("data not found"));
    }

    const {
      name,
      narx,
      qoldiq,
      unit_id,
      sklad1_qoldiq,
      sklad2_qoldiq,
      min_amount1,
      min_amount2,
    } = req.body;

    product.name = name;
    product.narx = narx;
    product.qoldiq = qoldiq;
    product.unit_id = unit_id;
    product.sklad1_qoldiq = sklad1_qoldiq;
    product.sklad2_qoldiq = sklad2_qoldiq;
    product.min_amount1 = min_amount1;
    product.min_amount2 = min_amount2;
    await product.save();

    res.send(product);
  };

  delete = async (req, res, next) => {
    const product = await ProductModel.findOne({
      where: { id: req.params.id },
    });

    if (!product) {
      throw new HttpException(404, req.mf("data not found"));
    }

    try {
      await product.destroy({ force: true }); // hard delete
    } catch (error) {
      await product.destroy(); // soft delete fallback
    }

    res.send(req.mf("data has been deleted"));
  };
}

/******************************************************************************
 *                               Export
 ******************************************************************************/
module.exports = new ProductController();
