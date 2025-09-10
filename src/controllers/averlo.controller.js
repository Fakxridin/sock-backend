const Decimal = require("decimal.js");
const AverloModel = require("../models/averlo.model");
const FoodShablonModel = require("../models/calculation.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const SalaryRegisterModel = require("../models/salary-register.model");
const MarkedCostModel = require("../models/marked_cost.model");
const BaseController = require("./BaseController");

class AverloController extends BaseController {
  create = async (req, res, next) => {
    this.checkValidation(req);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await AverloModel.sequelize.transaction();
    try {
      const newMiqdor = new Decimal(miqdor);

      // Check if enough "bishish_qoldiq" is available
      if (new Decimal(shablon.bishish_qoldiq || 0).lt(newMiqdor)) {
        throw new HttpException(400, "Yetarli bishish_qoldiq yo‘q");
      }

      // Update bishish_qoldiq and averlo_qoldiq in the shablon
      shablon.bishish_qoldiq = new Decimal(shablon.bishish_qoldiq || 0)
        .minus(newMiqdor)
        .toNumber();

      shablon.averlo_qoldiq = new Decimal(shablon.averlo_qoldiq || 0)
        .plus(newMiqdor)
        .toNumber();

      await shablon.save({ transaction });

      // Create Averlo record
      const averlo = await AverloModel.create(
        { shablon_id, miqdor, worker_id, user_id },
        { transaction }
      );

      // Update worker's bichishdan_soni
      const worker = await WorkerModel.findByPk(worker_id);
      if (worker) {
        worker.bichishdan_soni = new Decimal(worker.bichishdan_soni || 0)
          .plus(miqdor)
          .toNumber();
        await worker.save({ transaction });
      }

      // Create a Salary Register record
      await SalaryRegisterModel.create(
        {
          worker_id: worker_id,
          averlo_soni: miqdor, // Averlo miqdori
          tikish_soni: 0, // Tikish miqdori
          upakovka_soni: 0, // Upakovka miqdori
          etiketika_soni: 0,
          dazmol_soni: 0, // Dazmol miqdori
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

        // Calculate the cost based on averlo miqdor
        const averloCost = new Decimal(markedCost.averlo_cost).mul(miqdor);

        // Update worker's total_balance
        worker.total_balance = new Decimal(worker.total_balance || 0)
          .plus(averloCost)
          .toNumber();
        await worker.save({ transaction });
      }

      await transaction.commit();
      res.send(averlo);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  update = async (req, res, next) => {
    this.checkValidation(req);
    const averlo = await AverloModel.findByPk(req.params.id);
    if (!averlo) throw new HttpException(404, "Averlo topilmadi");

    const oldMiqdor = new Decimal(averlo.miqdor);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await AverloModel.sequelize.transaction();

    try {
      const diff = new Decimal(miqdor).minus(oldMiqdor);

      const newBishishQoldiq = new Decimal(shablon.bishish_qoldiq || 0).minus(
        diff
      );
      if (newBishishQoldiq.lt(0)) {
        throw new HttpException(400, "Yetarli bishish_qoldiq yo‘q");
      }

      shablon.bishish_qoldiq = newBishishQoldiq.toNumber();
      shablon.averlo_qoldiq = new Decimal(shablon.averlo_qoldiq || 0)
        .plus(diff)
        .toNumber();

      await shablon.save({ transaction });

      const worker = await WorkerModel.findByPk(worker_id);
      if (worker) {
        worker.bichishdan_soni = new Decimal(worker.bichishdan_soni || 0)
          .plus(diff)
          .toNumber();
        await worker.save({ transaction });
      }

      Object.assign(averlo, { shablon_id, miqdor, worker_id, user_id });
      await averlo.save({ transaction });

      await SalaryRegisterModel.update(
        {
          averlo_soni: miqdor, // Averlo miqdori yangilandi
          tikish_soni: 0, // Tikish miqdori 0
          upakovka_soni: 0, // Upakovka miqdori 0
          etiketika_soni: 0,
          dazmol_soni: 0, // Dazmol miqdori 0
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

        // Calculate the cost based on the averlo miqdor
        const averloCost = new Decimal(markedCost.averlo_cost).mul(miqdor);

        // Update worker's total_balance
        worker.total_balance = new Decimal(worker.total_balance || 0)
          .plus(averloCost)
          .toNumber();
        await worker.save({ transaction });
      }

      await transaction.commit();
      res.send(averlo);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  delete = async (req, res, next) => {
    const averlo = await AverloModel.findByPk(req.params.id);
    if (!averlo) throw new HttpException(404, "Averlo topilmadi");

    const shablon = await FoodShablonModel.findByPk(averlo.shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await AverloModel.sequelize.transaction();

    try {
      const miqdor = new Decimal(averlo.miqdor);

      shablon.bishish_qoldiq = new Decimal(shablon.bishish_qoldiq || 0)
        .plus(miqdor)
        .toNumber();

      shablon.averlo_qoldiq = new Decimal(shablon.averlo_qoldiq || 0)
        .minus(miqdor)
        .toNumber();

      await shablon.save({ transaction });

      const worker = await WorkerModel.findByPk(averlo.worker_id);
      if (worker) {
        worker.bichishdan_soni = new Decimal(worker.bichishdan_soni || 0)
          .minus(miqdor)
          .toNumber();
        await worker.save({ transaction });
      }

      await SalaryRegisterModel.update(
        {
          averlo_soni: 0, // Averlo miqdori 0 ga yangilandi
          tikish_soni: 0, // Tikish miqdori 0
          upakovka_soni: 0, // Upakovka miqdori 0
          etiketika_soni: 0,
          dazmol_soni: 0, // Dazmol miqdori 0
        },
        {
          where: { worker_id: averlo.worker_id },
          transaction,
        }
      );

      await averlo.destroy({ transaction });
      await transaction.commit();

      res.send({ message: "Averlo o‘chirildi" });
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  getAll = async (req, res) => {
    const data = await AverloModel.findAll({
      include: [
        { model: WorkerModel, as: "averlo_worker" },
        { model: FoodShablonModel, as: "averlo_shablon" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(data);
  };

  getById = async (req, res) => {
    const data = await AverloModel.findByPk(req.params.id, {
      include: [
        { model: WorkerModel, as: "averlo_worker" },
        { model: FoodShablonModel, as: "averlo_shablon" },
      ],
    });
    if (!data) throw new HttpException(404, "Topilmadi");
    res.send(data);
  };
}

module.exports = new AverloController();
