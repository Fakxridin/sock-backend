const { Op } = require("sequelize");
const SalaryRegisterModel = require("../models/salary-register.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");

class SalaryRegisterController extends BaseController {
  getAll = async (req, res, next) => {
    const salaryRegisters = await SalaryRegisterModel.findAll({
      order: [["datetime", "ASC"]],
      include: [{ model: WorkerModel, as: "worker" }],
    });
    res.send(salaryRegisters);
  };

  getById = async (req, res, next) => {
    const salaryRegister = await SalaryRegisterModel.findOne({
      where: { id: req.params.id },
      include: [{ model: WorkerModel, as: "worker" }],
    });

    if (!salaryRegister) {
      throw new HttpException(404, req.mf("Salary record not found"));
    }

    res.send(salaryRegister);
  };

  getByWorkerId = async (req, res, next) => {
    const { worker_id } = req.params;

    const salaryRegisters = await SalaryRegisterModel.findAll({
      where: { worker_id },
      include: [{ model: WorkerModel, as: "worker" }],
      order: [["datetime", "ASC"]],
    });

    if (!salaryRegisters || salaryRegisters.length === 0) {
      throw new HttpException(
        404,
        `Salary records not found for worker id ${worker_id}`
      );
    }

    res.send(salaryRegisters);
  };

  getByWorkerIdAndRange = async (req, res, next) => {
    const { worker_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      throw new HttpException(400, "Start and End date are required");
    }

    // Salary register records for the given worker within the date range
    const salaryRegisters = await SalaryRegisterModel.findAll({
      where: {
        worker_id,
        datetime: {
          [Op.between]: [new Date(start_date), new Date(end_date)],
        },
      },
      include: [{ model: WorkerModel, as: "worker" }],
      order: [["datetime", "ASC"]],
    });

    if (!salaryRegisters || salaryRegisters.length === 0) {
      throw new HttpException(
        404,
        `Salary records not found for worker id ${worker_id} in the given date range`
      );
    }

    // Calculate total values for tikish_soni, averlo_soni, dazmol_soni, upakovka_soni
    const totalTikishSoni = salaryRegisters.reduce(
      (acc, register) => acc + register.tikish_soni,
      0
    );
    const totalAverloSoni = salaryRegisters.reduce(
      (acc, register) => acc + register.averlo_soni,
      0
    );
    const totalDazmolSoni = salaryRegisters.reduce(
      (acc, register) => acc + register.dazmol_soni,
      0
    );
    const totalEtiketikaSoni = salaryRegisters.reduce(
      (acc, register) => acc + register.etiketika_soni,
      0
    );
    const totalUpakovkaSoni = salaryRegisters.reduce(
      (acc, register) => acc + register.upakovka_soni,
      0
    );

    // Find the worker to display their name
    const worker = salaryRegisters[0].worker;

    // Response includes the worker's details and the totals
    res.send({
      worker_id: worker.id,
      worker_name: worker.fullname,
      salary_registers: salaryRegisters,
      totals: {
        jami_tikish_soni: totalTikishSoni,
        jami_averlo_soni: totalAverloSoni,
        jami_etiketika_soni: totalEtiketikaSoni,
        jami_dazmol_soni: totalDazmolSoni,
        jami_upakovka_soni: totalUpakovkaSoni,
      },
    });
  };
  getByRangeForAllWorkers = async (req, res, next) => {
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      throw new HttpException(400, "Start and End date are required");
    }

    // Fetch all workers
    const workers = await WorkerModel.findAll();

    // Fetch salary records within the date range
    const salaryRegisters = await SalaryRegisterModel.findAll({
      where: {
        datetime: {
          [Op.between]: [start_date, end_date],
        },
      },
      include: [{ model: WorkerModel, as: "worker" }],
      order: [["datetime", "ASC"]],
    });

    // Initialize an object to store the totals for each worker
    const workerTotals = {};

    // Loop through each salary register and accumulate the totals for each worker
    salaryRegisters.forEach((register) => {
      const workerId = register.worker.id;

      // If worker doesn't exist in workerTotals, initialize the values
      if (!workerTotals[workerId]) {
        workerTotals[workerId] = {
          worker: register.worker, // Store full worker details
          tikish_soni: 0,
          averlo_soni: 0,
          dazmol_soni: 0,
          etiketika_soni: 0,
          upakovka_soni: 0,
        };
      }

      // Accumulate values for each worker
      workerTotals[workerId].tikish_soni += register.tikish_soni || 0;
      workerTotals[workerId].averlo_soni += register.averlo_soni || 0;
      workerTotals[workerId].dazmol_soni += register.dazmol_soni || 0;
      workerTotals[workerId].etiketika_soni += register.etiketika_soni || 0;
      workerTotals[workerId].upakovka_soni += register.upakovka_soni || 0;
    });

    // Add workers with no salary records to workerTotals (set their totals to 0)
    workers.forEach((worker) => {
      if (!workerTotals[worker.id]) {
        workerTotals[worker.id] = {
          worker: worker, // Include full worker details
          tikish_soni: 0,
          averlo_soni: 0,
          dazmol_soni: 0,
          etiketika_soni: 0,
          upakovka_soni: 0,
        };
      }
    });

    // Convert the workerTotals object to an array for the response
    const result = Object.values(workerTotals);

    res.send(result);
  };

  create = async (req, res, next) => {
    this.checkValidation(req);

    const {
      worker_id,
      tikish_soni,
      averlo_soni,
      dazmol_soni,
      etiketika_soni,
      upakovka_soni,
      datetime,
    } = req.body;

    const worker = await WorkerModel.findByPk(worker_id);
    if (!worker) {
      throw new HttpException(404, "Worker not found");
    }

    const salaryRegister = await SalaryRegisterModel.create({
      worker_id,
      tikish_soni,
      averlo_soni,
      dazmol_soni,
      etiketika_soni,
      upakovka_soni,
      datetime,
    });

    res.status(201).send(salaryRegister);
  };

  update = async (req, res, next) => {
    this.checkValidation(req);

    const salaryRegister = await SalaryRegisterModel.findByPk(req.params.id);
    if (!salaryRegister) {
      throw new HttpException(404, "Salary record not found");
    }

    const {
      worker_id,
      tikish_soni,
      averlo_soni,
      etiketika_soni,
      dazmol_soni,
      upakovka_soni,
      datetime,
    } = req.body;

    const worker = await WorkerModel.findByPk(worker_id);
    if (!worker) {
      throw new HttpException(404, "Worker not found");
    }

    Object.assign(salaryRegister, {
      worker_id,
      tikish_soni,
      etiketika_soni,
      averlo_soni,
      dazmol_soni,
      upakovka_soni,
      datetime,
    });

    await salaryRegister.save();

    res.send(salaryRegister);
  };

  delete = async (req, res, next) => {
    const salaryRegister = await SalaryRegisterModel.findByPk(req.params.id);
    if (!salaryRegister) {
      throw new HttpException(404, "Salary record not found");
    }

    await salaryRegister.destroy();

    res.send({ message: "Salary record deleted" });
  };
}

module.exports = new SalaryRegisterController();
