// controllers/prixod.controller.js
const {
  PrixodModel,
  PrixodTableModel,
} = require("../models/prixod-table.model");
const ProductModel = require("../models/product.model");
const KontragentModel = require("../models/kontragent.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const { Op } = require("sequelize");

class PrixodController extends BaseController {
  // controllers/prixod.controller.js (faqat create va update)
  create = async (req, res, next) => {
    this.checkValidation(req);
    const {
      datetime,
      total_overall_cost,
      rasxod_summa, // so‘m — UI qiymat, shunchaki saqlanadi
      rasxod_summa_dollar, // usd — HISOB-KITOB uchun ishlatiladi
      kurs_summa,
      comment,
      prixod_table,
    } = req.body;

    const transaction = await PrixodModel.sequelize.transaction();

    try {
      // 1) Asosiy prixodni yaratish
      const prixod = await PrixodModel.create(
        {
          datetime,
          total_overall_cost,
          rasxod_summa,
          rasxod_summa_dollar,
          kurs_summa,
          comment,
        },
        { transaction }
      );

      const totalInitialBase = prixod_table.reduce(
        (sum, i) =>
          sum + (Number(i.miqdor) || 0) * (Number(i.initial_cost) || 0),
        0
      );
      if (totalInitialBase === 0) {
        throw new HttpException(400, "Total base for rasxod division is 0");
      }

      const rasxodUsd = Number(rasxod_summa_dollar) || 0;

      for (const item of prixod_table) {
        const product = await ProductModel.findByPk(item.product_id, {
          transaction,
        });
        if (!product) {
          throw new HttpException(400, `Product not found: ${item.product_id}`);
        }

        const kontragent = await KontragentModel.findByPk(item.kontragent_id, {
          transaction,
        });
        if (!kontragent) {
          throw new HttpException(
            400,
            `Kontragent not found: ${item.kontragent_id}`
          );
        }

        item.prixod_id = prixod.id;

        const miqdor = Number(item.miqdor) || 0;
        const initial = Number(item.initial_cost) || 0;

        const base = miqdor * initial;
        const rasxodShare = (base / totalInitialBase) * rasxodUsd;
        const rasxodPerUnit = miqdor ? rasxodShare / miqdor : 0;

        item.product_cost = initial + rasxodPerUnit;
        item.total_cost = item.product_cost * miqdor;

        await PrixodTableModel.create(item, { transaction });

        product.sklad1_qoldiq += miqdor;
        product.narx = item.product_cost; // USD
        await product.save({ transaction });

        kontragent.balance += miqdor * initial;
        await kontragent.save({ transaction });
      }

      await transaction.commit();
      res.status(201).send({ success: true, prixod_id: prixod.id });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };
  // controllers/prixod.controller.js

  getPrixodsByDateRange = async (req, res, next) => {
    const { start_date, end_date, offset = 0 } = req.body; // Body'dan olish

    try {
      if (!start_date || !end_date) {
        throw new HttpException(400, "Start date and end date are required");
      }

      const whereCondition = {
        datetime: {
          [Op.between]: [start_date, end_date],
        },
      };

      const data = await PrixodModel.findAndCountAll({
        offset: Number(offset),
        limit: 30,
        order: [["datetime", "DESC"]],
        where: whereCondition, // Filtr qo'shildi
        include: [
          {
            model: PrixodTableModel,
            as: "prixodItems",
            include: [
              {
                model: KontragentModel,
                as: "kontragent",
                attributes: ["fullname"], // Kontragentni fullname'ini olish
              },
            ],
          },
        ],
      });

      res.send(data);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    this.checkValidation(req);
    const {
      datetime,
      total_overall_cost,
      rasxod_summa, // so‘m — saqlanadi
      rasxod_summa_dollar, // usd — hisob-kitoblar uchun
      comment,
      kurs_summa,
      prixod_table,
    } = req.body;
    const { id } = req.params;

    const transaction = await PrixodModel.sequelize.transaction();

    try {
      const prixod = await PrixodModel.findByPk(id, {
        include: { model: PrixodTableModel, as: "prixodItems" },
        transaction,
      });
      if (!prixod) throw new HttpException(404, "Prixod not found");

      // 1) Asosiy maydonlarni yangilash
      prixod.datetime = datetime;
      prixod.total_overall_cost = total_overall_cost;
      prixod.rasxod_summa = rasxod_summa; // so‘m — saqlanadi
      prixod.rasxod_summa_dollar = rasxod_summa_dollar; // usd — saqlanadi
      prixod.kurs_summa = kurs_summa;
      prixod.comment = comment;
      await prixod.save({ transaction });

      // 2) O‘chirilgan itemlarni topish va qaytarish
      const incomingIds = prixod_table.map((i) => i.id).filter(Boolean);
      const itemsToDelete = prixod.prixodItems.filter(
        (item) => !incomingIds.includes(item.id)
      );

      for (const itemToDelete of itemsToDelete) {
        const product = await ProductModel.findByPk(itemToDelete.product_id, {
          transaction,
        });
        if (product) {
          product.sklad1_qoldiq -= itemToDelete.miqdor;
          await product.save({ transaction });
        }

        const kontragent = await KontragentModel.findByPk(
          itemToDelete.kontragent_id,
          { transaction }
        );
        if (kontragent) {
          kontragent.balance -= itemToDelete.miqdor * itemToDelete.initial_cost;
          await kontragent.save({ transaction });
        }
      }

      await PrixodTableModel.destroy({
        where: { prixod_id: id, id: { [Op.notIn]: incomingIds } },
        transaction,
      });

      // 3) Rasxodni taqsimlash uchun umumiy baza
      const totalInitialBase = prixod_table.reduce(
        (sum, i) =>
          sum + (Number(i.miqdor) || 0) * (Number(i.initial_cost) || 0),
        0
      );
      if (totalInitialBase === 0) {
        throw new HttpException(400, "Total base for rasxod division is 0");
      }

      // 4) Hisob-kitoblar USD bo‘yicha
      const rasxodUsd = Number(rasxod_summa_dollar) || 0;

      // 5) Yangilash / qo‘shish sikli
      for (const item of prixod_table) {
        const product = await ProductModel.findByPk(item.product_id, {
          transaction,
        });
        if (!product) {
          throw new HttpException(400, `Product not found: ${item.product_id}`);
        }

        const kontragent = await KontragentModel.findByPk(item.kontragent_id, {
          transaction,
        });
        if (!kontragent) {
          throw new HttpException(
            400,
            `Kontragent not found: ${item.kontragent_id}`
          );
        }

        item.prixod_id = id;

        const miqdor = Number(item.miqdor) || 0;
        const initial = Number(item.initial_cost) || 0;

        const base = miqdor * initial;
        const rasxodShare = (base / totalInitialBase) * rasxodUsd; // USD ulushi
        const rasxodPerUnit = miqdor ? rasxodShare / miqdor : 0;

        item.product_cost = initial + rasxodPerUnit; // USD
        item.total_cost = item.product_cost * miqdor; // USD

        const oldItem = prixod.prixodItems.find((x) => x.id === item.id);

        if (oldItem) {
          // Ombor farqi
          const skladDiff = miqdor - oldItem.miqdor;
          if (skladDiff !== 0) {
            product.sklad1_qoldiq += skladDiff;
          }

          // Kontragent balans farqi (USD)
          const oldSumma = oldItem.miqdor * oldItem.initial_cost;
          const newSumma = miqdor * initial;
          const diffSumma = newSumma - oldSumma;
          if (diffSumma !== 0) {
            kontragent.balance += diffSumma;
            await kontragent.save({ transaction });
          }

          await PrixodTableModel.update(item, {
            where: { id: item.id },
            transaction,
          });
        } else {
          // Yangi item
          product.sklad1_qoldiq += miqdor;

          // Kontragent balansi (USD)
          kontragent.balance += miqdor * initial;
          await kontragent.save({ transaction });

          await PrixodTableModel.create(item, { transaction });
        }

        // Mahsulot narxini har doim yangilash (USD)
        product.narx = item.product_cost;
        await product.save({ transaction });
      }

      await transaction.commit();
      res.send({ success: true });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };

  delete = async (req, res, next) => {
    const { id } = req.params;
    const transaction = await PrixodModel.sequelize.transaction();

    try {
      const prixod = await PrixodModel.findByPk(id, {
        include: { model: PrixodTableModel, as: "prixodItems" },
        transaction,
      });
      if (!prixod) throw new HttpException(404, "Prixod not found");

      for (const item of prixod.prixodItems) {
        const product = await ProductModel.findByPk(item.product_id, {
          transaction,
        });
        if (product) {
          product.sklad1_qoldiq -= item.miqdor;
          await product.save({ transaction });
        }
        const kontragent = await KontragentModel.findByPk(item.kontragent_id, {
          transaction,
        });
        if (kontragent) {
          kontragent.balance -= item.miqdor * item.initial_cost;
          await kontragent.save({ transaction });
        }
      }

      await PrixodTableModel.destroy({ where: { prixod_id: id }, transaction });
      await prixod.destroy({ transaction });
      await transaction.commit();
      res.send({ success: true });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    const { offset = 0 } = req.query;
    try {
      const data = await PrixodModel.findAndCountAll({
        offset: Number(offset),
        limit: 30,
        order: [["datetime", "DESC"]],
        include: [
          {
            model: PrixodTableModel,
            as: "prixodItems",
            include: [
              {
                model: KontragentModel,
                as: "kontragent",
                attributes: ["fullname"],
              },
            ],
          },
        ],
      });

      res.send(data);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const data = await PrixodModel.findByPk(req.params.id, {
        include: [
          {
            model: PrixodTableModel,
            as: "prixodItems",
            include: [
              { model: ProductModel, as: "product" },
              { model: KontragentModel, as: "kontragent" },
            ],
          },
        ],
      });

      if (!data) throw new HttpException(404, "Prixod not found");
      res.send(data);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new PrixodController();
