const Decimal = require("decimal.js");
const DazmolModel = require("../models/dazmol.model");
const FoodShablonModel = require("../models/calculation.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

class DazmolController extends BaseController {
  create = async (req, res, next) => {
    this.checkValidation(req);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await DazmolModel.sequelize.transaction();
    try {
      const newMiqdor = new Decimal(miqdor);

      if (new Decimal(shablon.averlo_qoldiq || 0).lt(newMiqdor)) {
        throw new HttpException(400, "Yetarli averlo_qoldiq yo‘q");
      }

      shablon.averlo_qoldiq = new Decimal(shablon.averlo_qoldiq || 0)
        .minus(newMiqdor)
        .toNumber();

      shablon.dazmol_qoldiq = new Decimal(shablon.dazmol_qoldiq || 0)
        .plus(newMiqdor)
        .toNumber();

      await shablon.save({ transaction });

      const dazmol = await DazmolModel.create(
        { shablon_id, miqdor, worker_id, user_id },
        { transaction }
      );

      const worker = await WorkerModel.findByPk(worker_id);
      if (worker) {
        worker.dazmoldan_soni = new Decimal(worker.dazmoldan_soni || 0)
          .plus(miqdor)
          .toNumber();
        await worker.save({ transaction });
      }

      await transaction.commit();
      res.send(dazmol);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  update = async (req, res, next) => {
    this.checkValidation(req);
    const dazmol = await DazmolModel.findByPk(req.params.id);
    if (!dazmol) throw new HttpException(404, "Dazmol topilmadi");

    const oldMiqdor = new Decimal(dazmol.miqdor);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await DazmolModel.sequelize.transaction();

    try {
      const diff = new Decimal(miqdor).minus(oldMiqdor);

      const newAverloQoldiq = new Decimal(shablon.averlo_qoldiq || 0).minus(
        diff
      );
      if (newAverloQoldiq.lt(0)) {
        throw new HttpException(400, "Yetarli averlo_qoldiq yo‘q");
      }

      shablon.averlo_qoldiq = newAverloQoldiq.toNumber();
      shablon.dazmol_qoldiq = new Decimal(shablon.dazmol_qoldiq || 0)
        .plus(diff)
        .toNumber();

      await shablon.save({ transaction });

      const worker = await WorkerModel.findByPk(worker_id);
      if (worker) {
        worker.dazmoldan_soni = new Decimal(worker.dazmoldan_soni || 0)
          .plus(diff)
          .toNumber();
        await worker.save({ transaction });
      }

      Object.assign(dazmol, { shablon_id, miqdor, worker_id, user_id });
      await dazmol.save({ transaction });

      await transaction.commit();
      res.send(dazmol);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  delete = async (req, res, next) => {
    const dazmol = await DazmolModel.findByPk(req.params.id);
    if (!dazmol) throw new HttpException(404, "Dazmol topilmadi");

    const shablon = await FoodShablonModel.findByPk(dazmol.shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await DazmolModel.sequelize.transaction();

    try {
      const miqdor = new Decimal(dazmol.miqdor);

      shablon.averlo_qoldiq = new Decimal(shablon.averlo_qoldiq || 0)
        .plus(miqdor)
        .toNumber();

      shablon.dazmol_qoldiq = new Decimal(shablon.dazmol_qoldiq || 0)
        .minus(miqdor)
        .toNumber();

      await shablon.save({ transaction });

      const worker = await WorkerModel.findByPk(dazmol.worker_id);
      if (worker) {
        worker.dazmoldan_soni = new Decimal(worker.dazmoldan_soni || 0)
          .minus(miqdor)
          .toNumber();
        await worker.save({ transaction });
      }

      await dazmol.destroy({ transaction });
      await transaction.commit();

      res.send({ message: "Dazmol o‘chirildi" });
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  getAll = async (req, res) => {
    const data = await DazmolModel.findAll({
      include: [
        { model: WorkerModel, as: "dazmol_worker" },
        { model: FoodShablonModel, as: "dazmol_shablon" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(data);
  };

  getById = async (req, res) => {
    const data = await DazmolModel.findByPk(req.params.id, {
      include: [
        { model: WorkerModel, as: "dazmol_worker" },
        { model: FoodShablonModel, as: "dazmol_shablon" },
      ],
    });
    if (!data) throw new HttpException(404, "Topilmadi");
    res.send(data);
  };
}

module.exports = new DazmolController();
