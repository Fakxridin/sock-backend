const Decimal = require("decimal.js");
const UpakovkaModel = require("../models/upakovka.model");
const FoodShablonModel = require("../models/calculation.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

class UpakovkaController extends BaseController {
  create = async (req, res, next) => {
    this.checkValidation(req);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await UpakovkaModel.sequelize.transaction();
    try {
      const newMiqdor = new Decimal(miqdor);

      if (new Decimal(shablon.dazmol_qoldiq || 0).lt(newMiqdor)) {
        throw new HttpException(400, "Yetarli dazmol_qoldiq yo‘q");
      }

      shablon.dazmol_qoldiq = new Decimal(shablon.dazmol_qoldiq || 0)
        .minus(newMiqdor)
        .toNumber();

      shablon.sklad2_qoldiq = new Decimal(shablon.sklad2_qoldiq || 0)
        .plus(newMiqdor)
        .toNumber();

      await shablon.save({ transaction });

      const upakovka = await UpakovkaModel.create(
        { shablon_id, miqdor, worker_id, user_id },
        { transaction }
      );

      const worker = await WorkerModel.findByPk(worker_id);
      if (worker) {
        worker.bezakdan_soni = new Decimal(worker.bezakdan_soni || 0)
          .plus(miqdor)
          .toNumber();
        await worker.save({ transaction });
      }

      await transaction.commit();
      res.send(upakovka);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  update = async (req, res, next) => {
    this.checkValidation(req);
    const upakovka = await UpakovkaModel.findByPk(req.params.id);
    if (!upakovka) throw new HttpException(404, "Upakovka topilmadi");

    const oldMiqdor = new Decimal(upakovka.miqdor);
    const { shablon_id, miqdor, worker_id, user_id } = req.body;

    const shablon = await FoodShablonModel.findByPk(shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await UpakovkaModel.sequelize.transaction();

    try {
      const diff = new Decimal(miqdor).minus(oldMiqdor);

      const newDazmolQoldiq = new Decimal(shablon.dazmol_qoldiq || 0).minus(
        diff
      );
      if (newDazmolQoldiq.lt(0)) {
        throw new HttpException(400, "Yetarli dazmol_qoldiq yo‘q");
      }

      shablon.dazmol_qoldiq = newDazmolQoldiq.toNumber();
      shablon.sklad2_qoldiq = new Decimal(shablon.sklad2_qoldiq || 0)
        .plus(diff)
        .toNumber();

      await shablon.save({ transaction });

      const worker = await WorkerModel.findByPk(worker_id);
      if (worker) {
        worker.bezakdan_soni = new Decimal(worker.bezakdan_soni || 0)
          .plus(diff)
          .toNumber();
        await worker.save({ transaction });
      }

      Object.assign(upakovka, { shablon_id, miqdor, worker_id, user_id });
      await upakovka.save({ transaction });

      await transaction.commit();
      res.send(upakovka);
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  delete = async (req, res, next) => {
    const upakovka = await UpakovkaModel.findByPk(req.params.id);
    if (!upakovka) throw new HttpException(404, "Upakovka topilmadi");

    const shablon = await FoodShablonModel.findByPk(upakovka.shablon_id);
    if (!shablon) throw new HttpException(404, "Shablon topilmadi");

    const transaction = await UpakovkaModel.sequelize.transaction();

    try {
      const miqdor = new Decimal(upakovka.miqdor);

      shablon.dazmol_qoldiq = new Decimal(shablon.dazmol_qoldiq || 0)
        .plus(miqdor)
        .toNumber();

      shablon.sklad2_qoldiq = new Decimal(shablon.sklad2_qoldiq || 0)
        .minus(miqdor)
        .toNumber();

      await shablon.save({ transaction });

      const worker = await WorkerModel.findByPk(upakovka.worker_id);
      if (worker) {
        worker.bezakdan_soni = new Decimal(worker.bezakdan_soni || 0)
          .minus(miqdor)
          .toNumber();
        await worker.save({ transaction });
      }

      await upakovka.destroy({ transaction });
      await transaction.commit();

      res.send({ message: "Upakovka o‘chirildi" });
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  };

  getAll = async (req, res) => {
    const data = await UpakovkaModel.findAll({
      include: [
        { model: WorkerModel, as: "upakovka_worker" },
        { model: FoodShablonModel, as: "upakovka_shablon" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.send(data);
  };

  getById = async (req, res) => {
    const data = await UpakovkaModel.findByPk(req.params.id, {
      include: [
        { model: WorkerModel, as: "upakovka_worker" },
        { model: FoodShablonModel, as: "upakovka_shablon" },
      ],
    });
    if (!data) throw new HttpException(404, "Topilmadi");
    res.send(data);
  };
}

module.exports = new UpakovkaController();
