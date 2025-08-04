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
  create = async (req, res, next) => {
    this.checkValidation(req);
    const {
      datetime,
      total_overall_cost,
      rasxod_summa = 0,
      comment,
      prixod_table,
    } = req.body;
    const transaction = await PrixodModel.sequelize.transaction();

    try {
      const prixod = await PrixodModel.create(
        { datetime, total_overall_cost, rasxod_summa, comment },
        { transaction }
      );
      const totalInitialBase = prixod_table.reduce(
        (sum, i) => sum + i.miqdor * i.initial_cost,
        0
      );
      if (totalInitialBase === 0)
        throw new HttpException(400, "Total base for rasxod division is 0");

      for (const item of prixod_table) {
        const product = await ProductModel.findByPk(item.product_id, {
          transaction,
        });
        if (!product)
          throw new HttpException(400, `Product not found: ${item.product_id}`);
        const kontragent = await KontragentModel.findByPk(item.kontragent_id, {
          transaction,
        });
        if (!kontragent)
          throw new HttpException(
            400,
            `Kontragent not found: ${item.kontragent_id}`
          );

        item.prixod_id = prixod.id;
        const base = item.miqdor * item.initial_cost;
        const rasxodShare = (base / totalInitialBase) * rasxod_summa;
        const rasxodPerUnit = rasxodShare / item.miqdor;

        item.product_cost = Number(item.initial_cost) + rasxodPerUnit;
        item.total_cost = item.product_cost * item.miqdor;

        await PrixodTableModel.create(item, { transaction });
        product.sklad1_qoldiq += item.miqdor;
        product.narx = item.product_cost;
        await product.save({ transaction });

        kontragent.balance += item.miqdor * item.initial_cost;
        await kontragent.save({ transaction });
      }

      await transaction.commit();
      res.status(201).send({ success: true, prixod_id: prixod.id });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };

  update = async (req, res, next) => {
    this.checkValidation(req);
    const {
      datetime,
      total_overall_cost,
      rasxod_summa = 0,
      comment,
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

      // Update main prixod fields
      prixod.datetime = datetime;
      prixod.total_overall_cost = total_overall_cost;
      prixod.rasxod_summa = rasxod_summa;
      prixod.comment = comment;
      await prixod.save({ transaction });

      // Remove deleted items
      const incomingIds = prixod_table.map((i) => i.id).filter(Boolean);
      const itemsToDelete = prixod.prixodItems.filter(
        (item) => !incomingIds.includes(item.id)
      );

      // O'chirilgan itemlar uchun sklad va balansni qaytarish
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

      // Calculate total base for rasxod division
      const totalInitialBase = prixod_table.reduce(
        (sum, i) => sum + i.miqdor * i.initial_cost,
        0
      );
      if (totalInitialBase === 0)
        throw new HttpException(400, "Total base for rasxod division is 0");

      // Yangilangan va yangi itemlar uchun
      for (const item of prixod_table) {
        const product = await ProductModel.findByPk(item.product_id, {
          transaction,
        });
        if (!product)
          throw new HttpException(400, `Product not found: ${item.product_id}`);

        const kontragent = await KontragentModel.findByPk(item.kontragent_id, {
          transaction,
        });
        if (!kontragent)
          throw new HttpException(
            400,
            `Kontragent not found: ${item.kontragent_id}`
          );

        // Hisoblashlar
        item.prixod_id = id;
        const base = item.miqdor * item.initial_cost;
        const rasxodShare = (base / totalInitialBase) * rasxod_summa;
        const rasxodPerUnit = rasxodShare / item.miqdor;
        item.product_cost = Number(item.initial_cost) + rasxodPerUnit;
        item.total_cost = item.product_cost * item.miqdor;

        // Avvalgi itemni topish
        const oldItem = prixod.prixodItems.find((x) => x.id === item.id);

        if (oldItem) {
          // Skladni to'g'ri yangilash
          const skladDiff = item.miqdor - oldItem.miqdor;
          if (skladDiff !== 0) {
            product.sklad1_qoldiq += skladDiff;
          }

          // Kontragent balansini yangilash
          const oldSumma = oldItem.miqdor * oldItem.initial_cost;
          const newSumma = item.miqdor * item.initial_cost;
          const diffSumma = newSumma - oldSumma;

          if (diffSumma !== 0) {
            kontragent.balance += diffSumma;
            await kontragent.save({ transaction });
          }

          // Itemni yangilash
          await PrixodTableModel.update(item, {
            where: { id: item.id },
            transaction,
          });
        } else {
          // Yangi item
          product.sklad1_qoldiq += item.miqdor;
          kontragent.balance += item.miqdor * item.initial_cost;
          await kontragent.save({ transaction });

          // Yangi itemni yaratish
          await PrixodTableModel.create(item, { transaction });
        }

        // Mahsulot narxini har doim yangilash
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
