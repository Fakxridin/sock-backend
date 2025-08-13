const { Op } = require("sequelize");
const SalaryGiveModel = require("../models/salary_give.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const Decimal = require("decimal.js");
class SalaryGiveController extends BaseController {
  getAll = async (req, res, next) => {
    const salaryGives = await SalaryGiveModel.findAll({
      order: [["datetime", "ASC"]],
      include: [{ model: WorkerModel, as: "worker" }],
    });
    res.send(salaryGives);
  };

  getById = async (req, res, next) => {
    const salaryGive = await SalaryGiveModel.findOne({
      where: { id: req.params.id },
      include: [{ model: WorkerModel, as: "worker" }],
    });

    if (!salaryGive) {
      throw new HttpException(404, req.mf("Salary record not found"));
    }

    res.send(salaryGive);
  };

  getByWorkerId = async (req, res, next) => {
    const { worker_id } = req.params;

    const salaryGives = await SalaryGiveModel.findAll({
      where: { worker_id },
      include: [{ model: WorkerModel, as: "worker" }],
      order: [["datetime", "ASC"]],
    });

    if (!salaryGives || salaryGives.length === 0) {
      throw new HttpException(
        404,
        `Salary records not found for worker id ${worker_id}`
      );
    }

    res.send(salaryGives);
  };

  getByWorkerIdAndRange = async (req, res, next) => {
    const { worker_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      throw new HttpException(400, "Start and End date are required");
    }

    const salaryGives = await SalaryGiveModel.findAll({
      where: {
        worker_id,
        datetime: {
          [Op.between]: [new Date(start_date), new Date(end_date)],
        },
      },
      include: [{ model: WorkerModel, as: "worker" }],
      order: [["datetime", "ASC"]],
    });

    if (!salaryGives || salaryGives.length === 0) {
      throw new HttpException(
        404,
        `Salary records not found for worker id ${worker_id} in the given date range`
      );
    }

    res.send(salaryGives);
  };

  create = async (req, res, next) => {
    this.checkValidation(req);

    const { worker_id, summa, datetime } = req.body;

    const worker = await WorkerModel.findByPk(worker_id);
    if (!worker) {
      throw new HttpException(404, "Worker not found");
    }

    // Deduct the salary amount from worker's total balance
    if (new Decimal(worker.total_balance).lt(summa)) {
      throw new HttpException(400, "Insufficient balance");
    }

    worker.total_balance = new Decimal(worker.total_balance)
      .minus(summa)
      .toNumber();
    await worker.save();

    const salaryGive = await SalaryGiveModel.create({
      worker_id,
      summa,
      datetime,
    });

    res.status(201).send(salaryGive);
  };

  update = async (req, res, next) => {
    this.checkValidation(req);

    const salaryGive = await SalaryGiveModel.findByPk(req.params.id);
    if (!salaryGive) {
      throw new HttpException(404, "Salary record not found");
    }

    const { worker_id, summa, datetime } = req.body;
    const worker = await WorkerModel.findByPk(worker_id);
    if (!worker) {
      throw new HttpException(404, "Worker not found");
    }

    const oldSumma = salaryGive.summa;

    // Update the worker's total balance
    worker.total_balance = new Decimal(worker.total_balance)
      .plus(oldSumma) // Add back the old salary
      .minus(summa) // Subtract the new salary
      .toNumber();

    await worker.save();

    Object.assign(salaryGive, { worker_id, summa, datetime });
    await salaryGive.save();

    res.send(salaryGive);
  };

  delete = async (req, res, next) => {
    const salaryGive = await SalaryGiveModel.findByPk(req.params.id);
    if (!salaryGive) {
      throw new HttpException(404, "Salary record not found");
    }

    const worker = await WorkerModel.findByPk(salaryGive.worker_id);
    if (!worker) {
      throw new HttpException(404, "Worker not found");
    }

    // Add back the salary amount to worker's total balance
    worker.total_balance = new Decimal(worker.total_balance)
      .plus(salaryGive.summa)
      .toNumber();
    await worker.save();

    await salaryGive.destroy();

    res.send({ message: "Salary record deleted and balance updated" });
  };
}

module.exports = new SalaryGiveController();
