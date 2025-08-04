const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

class WorkerController extends BaseController {
  getAll = async (req, res, next) => {
    const workers = await WorkerModel.findAll({
      order: [["fullname", "ASC"]],
    });
    res.send(workers);
  };

  getById = async (req, res, next) => {
    const worker = await WorkerModel.findOne({
      where: { id: req.params.id },
    });

    if (!worker) {
      throw new HttpException(404, req.mf("data not found"));
    }

    res.send(worker);
  };

  create = async (req, res, next) => {
    this.checkValidation(req);

    const {
      fullname,
      phone_number,
      fixed_salary = 0,
      is_fixed = false,
      stanokdan_soni = 0,
      bichishdan_soni = 0,
      dazmoldan_soni = 0,
      bezakdan_soni = 0,
      total_balance = 0,
    } = req.body;

    const worker = await WorkerModel.create({
      fullname,
      phone_number,
      fixed_salary,
      is_fixed,
      stanokdan_soni,
      bichishdan_soni,
      dazmoldan_soni,
      bezakdan_soni,
      total_balance,
    });

    if (!worker) {
      throw new HttpException(500, req.mf("Something went wrong"));
    }

    res.status(201).send(worker);
  };

  update = async (req, res, next) => {
    this.checkValidation(req);

    const worker = await WorkerModel.findOne({
      where: { id: req.params.id },
    });

    if (!worker) {
      throw new HttpException(404, req.mf("data not found"));
    }

    const {
      fullname,
      phone_number,
      fixed_salary,
      is_fixed,
      stanokdan_soni,
      bichishdan_soni,
      dazmoldan_soni,
      bezakdan_soni,
      total_balance,
    } = req.body;

    worker.fullname = fullname;
    worker.phone_number = phone_number;
    worker.fixed_salary = fixed_salary;
    worker.is_fixed = is_fixed;
    worker.stanokdan_soni = stanokdan_soni;
    worker.bichishdan_soni = bichishdan_soni;
    worker.dazmoldan_soni = dazmoldan_soni;
    worker.bezakdan_soni = bezakdan_soni;

    if (total_balance !== undefined) {
      worker.total_balance = total_balance;
    }

    await worker.save();

    res.send(worker);
  };

  delete = async (req, res, next) => {
    const worker = await WorkerModel.findOne({
      where: { id: req.params.id },
    });

    if (!worker) {
      throw new HttpException(404, req.mf("data not found"));
    }

    try {
      await worker.destroy({ force: true });
    } catch (error) {
      await worker.destroy();
    }

    res.send(req.mf("data has been deleted"));
  };
}

module.exports = new WorkerController();
