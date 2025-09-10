const Decimal = require("decimal.js");
const EtiketikaModel = require("../models/etiketika.model");
const FoodShablonModel = require("../models/calculation.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const SalaryRegisterModel = require("../models/salary-register.model");
const MarkedCostModel = require("../models/marked_cost.model");
const BaseController = require("./BaseController");

class EtiketikaController extends BaseController {
  create = async (req, res, next) => {
    this.checkValidation(req);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await EtiketikaModel.sequelize.transaction();
    try {
      const newMiqdor = new Decimal(miqdor);

      if (new Decimal(shablon.dazmol_qoldiq || 0).lt(newMiqdor)) {
        throw new HttpException(400, "Yetarli dazmol_qoldiq yo‘q");
      }

      shablon.dazmol_qoldiq = new Decimal(shablon.dazmol_qoldiq || 0)
        .minus(newMiqdor)
        .toNumber();

      shablon.etiketika_qoldiq = new Decimal(shablon.etiketika_qoldiq || 0)
        .plus(newMiqdor)
        .toNumber();

      await shablon.save({ transaction });

      const etiketika = await EtiketikaModel.create(
        { shablon_id, miqdor, worker_id, user_id },
        { transaction }
      );

      const worker = await WorkerModel.findByPk(worker_id);
      // if (worker) {
      //   worker.etiketikadan_soni = new Decimal(worker.etiketikadan_soni || 0)
      //     .plus(miqdor)
      //     .toNumber();
      //   await worker.save({ transaction });
      // }

      // Create a Salary Register record
      await SalaryRegisterModel.create(
        {
          worker_id: worker_id,
          etiketika_soni: miqdor,
          dazmol_soni: 0,
          tikish_soni: 0, // Tikish miqdori
          averlo_soni: 0, // Averlo miqdori
          upakovka_soni: 0, // Upakovka miqdori
          datetime: Math.floor(Date.now() / 1000), // Unix timestamp
        },
        { transaction }
      );

      // If worker.is_fixed is false, add the cost to the worker's total_balance
      if (!worker.is_fixed) {
        // Get the MarkedCost from the database
        const markedCost = await MarkedCostModel.findOne({
          where: { id: 1 }, // Example: modify this as needed
        });

        if (!markedCost) {
          throw new HttpException(404, "MarkedCost topilmadi");
        }

        // Calculate the cost based on etiketika miqdor
        const etiketikaCost = new Decimal(markedCost.etiketika_cost).mul(
          miqdor
        );

        // Update worker's total_balance
        worker.total_balance = new Decimal(worker.total_balance || 0)
          .plus(etiketikaCost)
          .toNumber();
        await worker.save({ transaction });
      }

      await transaction.commit();
      res.send(etiketika);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  update = async (req, res, next) => {
    this.checkValidation(req);
    const etiketika = await EtiketikaModel.findByPk(req.params.id);
    if (!etiketika) throw new HttpException(404, "etiketika topilmadi");

    const oldMiqdor = new Decimal(etiketika.miqdor);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await EtiketikaModel.sequelize.transaction();

    try {
      const diff = new Decimal(miqdor).minus(oldMiqdor);

      const newDazmolQoldiq = new Decimal(shablon.dazmol_qoldiq || 0).minus(
        diff
      );
      if (newDazmolQoldiq.lt(0)) {
        throw new HttpException(400, "Yetarli averlo_qoldiq yo‘q");
      }

      shablon.dazmol_qoldiq = newDazmolQoldiq.toNumber();
      shablon.etiketika_qoldiq = new Decimal(shablon.etiketika_qoldiq || 0)
        .plus(diff)
        .toNumber();

      await shablon.save({ transaction });

      const worker = await WorkerModel.findByPk(worker_id);
      // if (worker) {
      //   worker.etiketikadan_soni = new Decimal(worker.etiketikadan_soni || 0)
      //     .plus(diff)
      //     .toNumber();
      //   await worker.save({ transaction });
      // }

      Object.assign(etiketika, { shablon_id, miqdor, worker_id, user_id });
      await etiketika.save({ transaction });

      await SalaryRegisterModel.update(
        {
          etiketika_soni: miqdor, // etiketika miqdori yangilandi
          dazmol_soni: 0,
          tikish_soni: 0, // Tikish miqdori 0
          averlo_soni: 0, // Averlo miqdori 0
          upakovka_soni: 0, // Upakovka miqdori 0
        },
        {
          where: { worker_id: worker_id },
          transaction,
        }
      );

      // If worker.is_fixed is false, update the total_balance
      if (!worker.is_fixed) {
        // Get the MarkedCost from the database
        const markedCost = await MarkedCostModel.findOne({
          where: { id: 1 }, // Example: modify this as needed
        });

        if (!markedCost) {
          throw new HttpException(404, "MarkedCost topilmadi");
        }

        // Calculate the cost based on the etiketika miqdor
        const etiketikaCost = new Decimal(markedCost.etiketika_cost).mul(
          miqdor
        );

        // Update worker's total_balance
        worker.total_balance = new Decimal(worker.total_balance || 0)
          .plus(etiketikaCost)
          .toNumber();
        await worker.save({ transaction });
      }

      await transaction.commit();
      res.send(etiketika);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  delete = async (req, res, next) => {
    const etiketika = await EtiketikaModel.findByPk(req.params.id);
    if (!etiketika) throw new HttpException(404, "etiketika topilmadi");

    const shablon = await FoodShablonModel.findByPk(etiketika.shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await EtiketikaModel.sequelize.transaction();

    try {
      const miqdor = new Decimal(etiketika.miqdor);

      shablon.dazmol_qoldiq = new Decimal(shablon.dazmol_qoldiq || 0)
        .plus(miqdor)
        .toNumber();

      shablon.etiketika_qoldiq = new Decimal(shablon.etiketika_qoldiq || 0)
        .minus(miqdor)
        .toNumber();

      await shablon.save({ transaction });

      // const worker = await WorkerModel.findByPk(etiketika.worker_id);
      // if (worker) {
      //   worker.etiketikadan_soni = new Decimal(worker.etiketikadan_soni || 0)
      //     .minus(miqdor)
      //     .toNumber();
      //   await worker.save({ transaction });
      // }

      await SalaryRegisterModel.update(
        {
          dazmol_soni: 0, // etiketika miqdori 0 ga yangilandi
          etiketika_soni: 0,
          tikish_soni: 0, // Tikish miqdori 0
          averlo_soni: 0, // Averlo miqdori 0
          upakovka_soni: 0, // Upakovka miqdori 0
        },
        {
          where: { worker_id: etiketika.worker_id },
          transaction,
        }
      );

      await etiketika.destroy({ transaction });
      await transaction.commit();

      res.send({ message: "etiketika o‘chirildi" });
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  getAll = async (req, res) => {
    const data = await EtiketikaModel.findAll({
      include: [
        { model: WorkerModel, as: "etiketika_worker" },
        { model: FoodShablonModel, as: "etiketika_shablon" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(data);
  };

  getById = async (req, res) => {
    const data = await EtiketikaModel.findByPk(req.params.id, {
      include: [
        { model: WorkerModel, as: "etiketika_worker" },
        { model: FoodShablonModel, as: "etiketika_shablon" },
      ],
    });
    if (!data) throw new HttpException(404, "Topilmadi");
    res.send(data);
  };
}

module.exports = new EtiketikaController();
