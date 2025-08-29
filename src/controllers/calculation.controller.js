const path = require("path");
const fs = require("fs");
const { sequelize } = require("../start");
const FoodShablonModel = require("../models/calculation.model");
const NeededProductModel = require("../models/needed-product.model");
const ProductModel = require("../models/product.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const { deleteIfExists } = require("../utils/file.utils");

// -------- Helpers (shu fayl ichida) --------
function parseIngredients(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function isReprepareError(err) {
  return (
    (err && (err.errno === 1615 || err.code === "ER_PS_MUST_REPREPARE")) ||
    /Prepared statement needs to be re-prepared/i.test(err?.message || "")
  );
}

async function withRetry(fn, { retries = 3, delayMs = 80 } = {}) {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0 && isReprepareError(err)) {
      await new Promise((r) => setTimeout(r, delayMs));
      return withRetry(fn, { retries: retries - 1, delayMs: delayMs * 2 });
    }
    throw err;
  }
}

// -------------------------------------------

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
        img_name: json.img_name || null,
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
    const shablon = await withRetry(() =>
      FoodShablonModel.findByPk(req.params.id, {
        include: [
          {
            model: NeededProductModel,
            as: "ingredients",
            include: ["product"],
          },
        ],
      })
    );

    if (!shablon) throw new HttpException(404, req.mf("data not found"));

    const json = shablon.toJSON();
    res.send({
      id: json.id,
      name: json.name,
      img_name: json.img_name || null,
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

  // 🔹 Create (tranzaksiya + retry)
  create = async (req, res, next) => {
    this.checkValidation(req);

    const ingredientsArr = parseIngredients(req.body.ingredients);

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
    } = req.body;

    const total_spent = ingredientsArr.reduce(
      (acc, i) => acc + Number(i?.summa || 0),
      0
    );

    const newImgName = req.file ? req.file.filename : null;

    const shablon = await withRetry(async () => {
      return sequelize.transaction(async (t) => {
        const created = await FoodShablonModel.create(
          {
            name,
            img_name: newImgName,
            total_spent: Number(total_spent) || 0,
            selling_price: Number(selling_price) || 0,
            qoldiq: Number(qoldiq) || 0,
            total_spent_som: Number(total_spent_som) || 0,
            selling_price_som: Number(selling_price_som) || 0,
            kurs_summa: Number(kurs_summa) || 0,
            sklad1_qoldiq: Number(sklad1_qoldiq) || 0,
            sklad2_qoldiq: Number(sklad2_qoldiq) || 0,
            bishish_qoldiq: Number(bishish_qoldiq) || 0,
            averlo_qoldiq: Number(averlo_qoldiq) || 0,
            dazmol_qoldiq: Number(dazmol_qoldiq) || 0,
          },
          { transaction: t }
        );

        if (ingredientsArr.length) {
          const items = ingredientsArr.map((i) => ({
            food_shablon_id: created.id,
            product_id: Number(i.product_id),
            miqdor: Number(i.miqdor),
            summa: Number(i.summa),
          }));
          await NeededProductModel.bulkCreate(items, { transaction: t });
        }

        return created;
      });
    });

    if (!shablon) throw new HttpException(500, req.mf("Something went wrong"));

    req.params.id = shablon.id;
    return this.getById(req, res, next);
  };

  // 🔹 Update (tranzaksiya + retry)
  update = async (req, res, next) => {
    this.checkValidation(req);

    const ingredientsArr = parseIngredients(req.body.ingredients);

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
    } = req.body;

    const total_spent = ingredientsArr.reduce(
      (acc, i) => acc + Number(i?.summa || 0),
      0
    );

    await withRetry(async () => {
      await sequelize.transaction(async (t) => {
        const shablon = await FoodShablonModel.findByPk(req.params.id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!shablon) throw new HttpException(404, req.mf("data not found"));

        if (req.file) {
          if (shablon.img_name) deleteIfExists(shablon.img_name);
          shablon.img_name = req.file.filename;
        }

        Object.assign(shablon, {
          name,
          total_spent: Number(total_spent) || 0,
          selling_price: Number(selling_price) || 0,
          total_spent_som: Number(total_spent_som) || 0,
          selling_price_som: Number(selling_price_som) || 0,
          kurs_summa: Number(kurs_summa) || 0,
          qoldiq: Number(qoldiq) || 0,
          sklad1_qoldiq: Number(sklad1_qoldiq) || 0,
          sklad2_qoldiq: Number(sklad2_qoldiq) || 0,
          bishish_qoldiq: Number(bishish_qoldiq) || 0,
          averlo_qoldiq: Number(averlo_qoldiq) || 0,
          dazmol_qoldiq: Number(dazmol_qoldiq) || 0,
        });

        await shablon.save({ transaction: t });

        // ingredients’ni to‘liq qayta yozish — hammasi bitta tranzaksiyada
        await NeededProductModel.destroy({
          where: { food_shablon_id: shablon.id },
          transaction: t,
        });

        if (ingredientsArr.length) {
          const items = ingredientsArr.map((i) => ({
            food_shablon_id: shablon.id,
            product_id: Number(i.product_id),
            miqdor: Number(i.miqdor),
            summa: Number(i.summa),
          }));
          await NeededProductModel.bulkCreate(items, { transaction: t });
        }
      });
    });

    return this.getById(req, res, next);
  };

  // 🔹 Delete (tranzaksiya + retry)
  delete = async (req, res, next) => {
    await withRetry(async () => {
      await sequelize.transaction(async (t) => {
        const shablon = await FoodShablonModel.findByPk(req.params.id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!shablon) throw new HttpException(404, req.mf("data not found"));

        // Eski rasmni o‘chiramiz (agar bo‘lsa)
        if (shablon.img_name) deleteIfExists(shablon.img_name);

        // Avval childlarini tozalash
        await NeededProductModel.destroy({
          where: { food_shablon_id: shablon.id },
          transaction: t,
        });

        await shablon.destroy({ transaction: t });
      });
    });

    res.send(req.mf("data has been deleted"));
  };

  // 🔹 Get ingredients by shablon_id with product sklad2_qoldiq
  getIngredientsByShablonId = async (req, res, next) => {
    const { shablon_id } = req.params;
    try {
      const shablon = await withRetry(() =>
        FoodShablonModel.findByPk(shablon_id, {
          include: [
            {
              model: NeededProductModel,
              as: "ingredients",
              include: [
                {
                  model: ProductModel,
                  as: "product",
                  attributes: ["id", "name", "sklad2_qoldiq"],
                },
              ],
            },
          ],
        })
      );

      if (!shablon) {
        return next(new HttpException(404, "Shablon topilmadi"));
      }

      const ingredients = shablon.ingredients.map((ing) => ({
        product_id: ing.product_id,
        product_name: ing.product?.name,
        miqdor: ing.miqdor,
        summa: ing.summa,
        sklad2_qoldiq: ing.product?.sklad2_qoldiq,
      }));

      res.send({
        shablon_id: shablon.id,
        name: shablon.name,
        img_name: shablon.img_name || null,
        ingredients,
      });
    } catch (error) {
      next(new HttpException(500, "Shablonni yuklashda xatolik yuz berdi"));
    }
  };
}

module.exports = new FoodShablonController();
