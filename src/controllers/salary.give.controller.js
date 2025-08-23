const { Op } = require("sequelize");
const SalaryGiveModel = require("../models/salary_give.model");
const KassaModel = require("../models/kassa.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const Decimal = require("decimal.js");

class SalaryGiveController extends BaseController {
  // GET /salary-give
  getAll = async (req, res, next) => {
    const salaryGives = await SalaryGiveModel.findAll({
      order: [["datetime", "ASC"]],
      include: [
        { model: KassaModel },
        { model: WorkerModel, attributes: ["fullname"] },
      ],
    });
    res.send(salaryGives);
  };

  // GET /salary-give/:id
  getById = async (req, res, next) => {
    const salaryGive = await SalaryGiveModel.findOne({
      where: { id: req.params.id },
      include: [KassaModel],
    });

    if (!salaryGive) {
      throw new HttpException(404, "Salary record not found");
    }

    res.send(salaryGive);
  };

  // GET /salary-give/worker/:worker_id
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

  // GET /salary-give/worker/:worker_id/range
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

  // POST /salary-give
  // POST /salary-give
  create = async (req, res, next) => {
    this.checkValidation(req);

    const {
      worker_id,
      kurs_summa,
      dollar_summa,
      som_summa,
      total_dollar_summa,
      total_som_summa,
      comment,
      user_fullname, // Now taken from req.body
    } = req.body;

    const doc_type = "Maosh Berish"; // Constant doc_type value for Salary Give
    const type = 0; // Type 0, indicating a salary give (expense)

    const datetime = Math.floor(new Date().getTime() / 1000); // Set datetime as current timestamp divided by 1000
    const summa = 0; // Default summa to 0 as it's not provided in the request body

    const transaction = await SalaryGiveModel.sequelize.transaction();

    try {
      // 1. Create Kassa record first
      const kassa = await KassaModel.create(
        {
          user_fullname,
          kurs_summa,
          som_summa,
          dollar_summa,
          type,
          doc_type,
          total_dollar_summa,
          total_som_summa,
          comment,
        },
        { transaction }
      );

      if (!kassa) {
        throw new HttpException(500, "Something went wrong with Kassa");
      }

      // 2. Create SalaryGive record with the Kassa ID
      const salaryGive = await SalaryGiveModel.create(
        {
          worker_id,
          summa,
          datetime, // Use the generated datetime
          kassa_id: kassa.id, // Store the Kassa ID
          user_fullname, // Include the user_fullname here
          kurs_summa, // Add kurs_summa to SalaryGive
          som_summa, // Add som_summa to SalaryGive
          dollar_summa, // Add dollar_summa to SalaryGive
          total_som_summa, // Add total_som_summa to SalaryGive
          total_dollar_summa, // Add total_dollar_summa to SalaryGive
          comment, // Add comment to SalaryGive
        },
        { transaction }
      );

      if (!salaryGive) {
        throw new HttpException(500, "Something went wrong with SalaryGive");
      }

      // 4. Deduct the salary amount from worker's total balance (using total_som_summa)
      const worker = await WorkerModel.findOne({
        where: { id: worker_id },
      });
      if (worker) {
        worker.total_balance -= total_som_summa; // Subtract the total_som_summa from worker's total balance
        await worker.save({ transaction });
      }

      await transaction.commit();
      res.status(201).send(salaryGive);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  update = async (req, res, next) => {
    this.checkValidation(req);

    const transaction = await SalaryGiveModel.sequelize.transaction();

    const salaryGive = await SalaryGiveModel.findOne({
      where: { id: req.params.id },
    });

    if (!salaryGive) {
      throw new HttpException(404, "Salary record not found");
    }

    const {
      worker_id,
      kurs_summa,
      dollar_summa,
      som_summa,
      total_dollar_summa,
      total_som_summa,
      comment,
      user_fullname, // Now taken from req.body
    } = req.body;

    const previousTotalSom = salaryGive.total_som_summa;
    const previousTotalDollar = salaryGive.total_dollar_summa;

    try {
      // Update the SalaryGive record
      salaryGive.worker_id = worker_id;
      salaryGive.summa = 0; // Reset summa to 0 as requested
      salaryGive.datetime = Math.floor(new Date().getTime() / 1000); // Update datetime with current timestamp (divided by 1000)
      salaryGive.user_fullname = user_fullname; // Ensure user_fullname is updated
      salaryGive.kurs_summa = kurs_summa; // Add kurs_summa to SalaryGive
      salaryGive.som_summa = som_summa; // Add som_summa to SalaryGive
      salaryGive.dollar_summa = dollar_summa; // Add dollar_summa to SalaryGive
      salaryGive.total_som_summa = total_som_summa; // Add total_som_summa to SalaryGive
      salaryGive.total_dollar_summa = total_dollar_summa; // Add total_dollar_summa to SalaryGive
      salaryGive.comment = comment; // Update comment in SalaryGive

      await salaryGive.save({ transaction });

      // Update the related Kassa record after modification
      const kassa = await KassaModel.findOne({
        where: { id: salaryGive.kassa_id },
      });
      if (kassa) {
        // Update all fields in Kassa, not just total_som_summa and total_dollar_summa
        kassa.kurs_summa = kurs_summa;
        kassa.som_summa = som_summa;
        kassa.dollar_summa = dollar_summa;
        kassa.total_som_summa += total_som_summa - previousTotalSom;
        kassa.total_dollar_summa += total_dollar_summa - previousTotalDollar;
        kassa.comment = comment;

        // Ensure other fields are updated as well (you can add more fields as needed)
        // For example, you may need to update:
        // kassa.date_updated = new Date(); // Add the date_updated field if it exists
        // kassa.other_field = some_value; // Add any other fields that need updating

        await kassa.save({ transaction });
      } else {
        throw new HttpException(404, "Kassa not found");
      }

      // Update the worker's balance after modification
      const worker = await WorkerModel.findOne({ where: { id: worker_id } });
      if (worker) {
        worker.total_balance -= total_som_summa - previousTotalSom;
        await worker.save({ transaction });
      } else {
        throw new HttpException(404, "Worker not found");
      }

      await transaction.commit();
      res.send(salaryGive);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  // DELETE /salary-give/:id
  delete = async (req, res, next) => {
    const transaction = await SalaryGiveModel.sequelize.transaction();

    const salaryGive = await SalaryGiveModel.findOne({
      where: { id: req.params.id },
    });

    if (!salaryGive) {
      throw new HttpException(404, "Salary record not found");
    }

    try {
      // Remove the related Kassa totals first and delete Kassa record
      const kassa = await KassaModel.findOne({
        where: { id: salaryGive.kassa_id },
      });
      if (kassa) {
        // Deduct the totals from Kassa before deleting
        kassa.total_som_summa -= salaryGive.total_som_summa;
        kassa.total_dollar_summa -= salaryGive.total_dollar_summa;

        // Now perform the deletion of Kassa record
        await kassa.destroy({ force: true, transaction });
      }

      // Update the worker's balance after deletion
      const worker = await WorkerModel.findOne({
        where: { id: salaryGive.worker_id },
      });
      if (worker) {
        worker.total_balance += salaryGive.total_som_summa; // Add back the salary amount
        await worker.save({ transaction });
      }

      // Perform the deletion of SalaryGive record
      await salaryGive.destroy({ force: true, transaction }); // Hard delete the SalaryGive record
      await transaction.commit();
      res.send({
        message:
          "Salary record and related Kassa record deleted, balance updated",
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
}

module.exports = new SalaryGiveController();
