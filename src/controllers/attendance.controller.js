const WorkerAttendanceModel = require("../models/attendance.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const { Op } = require("sequelize");

class WorkerAttendanceController extends BaseController {
  /**
   * Bulk upsert attendance records
   * Expects body: [{ worker_id, date, is_present }, ...]
   * Updates worker.total_balance for fixed workers when attendance changes
   */
  upsertBulk = async (req, res, next) => {
    this.checkValidation(req);
    const records = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      throw new HttpException(400, req.mf("No attendance records provided"));
    }

    const results = [];
    for (const { worker_id, date, is_present } of records) {
      // Fetch worker and check fixed
      const worker = await WorkerModel.findByPk(worker_id);
      if (!worker) throw new HttpException(404, req.mf("Worker not found"));
      let oldPresent = false;
      // Try find existing attendance
      const existing = await WorkerAttendanceModel.findOne({
        where: { worker_id, date },
      });
      if (existing) oldPresent = existing.is_present;

      // Upsert attendance
      if (existing) {
        existing.is_present = is_present;
        await existing.save();
        results.push(existing);
      } else {
        const instance = await WorkerAttendanceModel.create({
          worker_id,
          date,
          is_present,
        });
        results.push(instance);
      }

      // Adjust total_balance if worker is fixed
      if (worker.is_fixed) {
        const salary = parseFloat(worker.fixed_salary);
        let diff = 0;
        if (!oldPresent && is_present) {
          // gained a present day
          diff = salary;
        } else if (oldPresent && !is_present) {
          // lost a present day
          diff = -salary;
        }
        if (diff !== 0) {
          worker.total_balance = parseFloat(worker.total_balance) + diff;
          await worker.save();
        }
      }
    }

    res.status(200).send(results);
  };

  /** Get attendance for all workers between two dates */
  getByDateRange = async (req, res, next) => {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate)
      throw new HttpException(
        400,
        req.mf("startDate and endDate are required")
      );
    const workers = await WorkerModel.findAll({
      attributes: ["id", "fullname"],
    });
    const attendances = await WorkerAttendanceModel.findAll({
      where: { date: { [Op.between]: [startDate, endDate] } },
    });
    const dates = [];
    for (
      let d = new Date(startDate);
      d <= new Date(endDate);
      d.setDate(d.getDate() + 1)
    )
      dates.push(d.toISOString().split("T")[0]);
    const result = dates.map((date) => ({
      date,
      statuses: workers.map((w) => {
        const rec = attendances.find(
          (a) => a.worker_id === w.id && a.date === date
        );
        return {
          worker_id: w.id,
          fullname: w.fullname,
          is_present: rec ? rec.is_present : false,
        };
      }),
    }));
    res.status(200).send(result);
  };

  /** Get attendance for single worker */
  getByDateRangeByWorkerId = async (req, res, next) => {
    const { workerId, startDate, endDate } = req.body;
    if (!workerId || !startDate || !endDate)
      throw new HttpException(
        400,
        req.mf("workerId, startDate and endDate are required")
      );
    const attendances = await WorkerAttendanceModel.findAll({
      where: {
        worker_id: workerId,
        date: { [Op.between]: [startDate, endDate] },
      },
    });
    const map = {};
    attendances.forEach((a) => (map[a.date] = a.is_present));
    const result = [];
    for (
      let d = new Date(startDate);
      d <= new Date(endDate);
      d.setDate(d.getDate() + 1)
    ) {
      const date = d.toISOString().split("T")[0];
      result.push({ date, is_present: !!map[date] });
    }
    res.status(200).send(result);
  };
}

module.exports = new WorkerAttendanceController();
