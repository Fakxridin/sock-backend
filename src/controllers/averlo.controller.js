const Decimal = require("decimal.js");
const AverloModel = require("../models/averlo.model");
const FoodShablonModel = require("../models/calculation.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
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

      if (new Decimal(shablon.bishish_qoldiq || 0).lt(newMiqdor)) {
        throw new HttpException(400, "Yetarli bishish_qoldiq yo‘q");
      }

      shablon.bishish_qoldiq = new Decimal(shablon.bishish_qoldiq || 0)
        .minus(newMiqdor)
        .toNumber();

      shablon.averlo_qoldiq = new Decimal(shablon.averlo_qoldiq || 0)
        .plus(newMiqdor)
        .toNumber();

      await shablon.save({ transaction });

      const averlo = await AverloModel.create(
        { shablon_id, miqdor, worker_id, user_id },
        { transaction }
      );

      const worker = await WorkerModel.findByPk(worker_id);
      if (worker) {
        worker.bichishdan_soni = new Decimal(worker.bichishdan_soni || 0)
          .plus(miqdor)
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
