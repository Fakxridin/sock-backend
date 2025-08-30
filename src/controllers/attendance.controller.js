const WorkerAttendanceModel = require("../models/attendance.model");
const WorkerModel = require("../models/worker.model");
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const { Op } = require("sequelize");

class WorkerAttendanceController extends BaseController {
  /**
   * Bulk upsert attendance records
   * Body: [{ worker_id, date, is_present, come_time?, left_time?, worked_minutes? }, ...]
   * Updates worker.total_balance for fixed workers when attendance changes
   */
  upsertBulk = async (req, res, next) => {
    this.checkValidation(req);
    const records = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      throw new HttpException(400, req.mf("No attendance records provided"));
    }

    const results = [];

    for (const rec of records) {
      const {
        worker_id,
        date,
        is_present,
        come_time = null,
        left_time = null,
        worked_minutes = null,
      } = rec || {};

      if (!worker_id || !date || typeof is_present !== "boolean") {
        throw new HttpException(
          400,
          req.mf("worker_id, date, is_present are required")
        );
      }

      // Fixed worker lookup
      const worker = await WorkerModel.findByPk(worker_id);
      if (!worker) throw new HttpException(404, req.mf("Worker not found"));

      // Existing attendance (unique: worker_id + date)
      const existing = await WorkerAttendanceModel.findOne({
        where: { worker_id, date },
      });

      let oldPresent = false;
      if (existing) oldPresent = !!existing.is_present;

      // Normalize minutes: if not present -> 0
      const normalizedWorked =
        is_present === false
          ? 0
          : worked_minutes ?? existing?.worked_minutes ?? 0;

      if (existing) {
        existing.is_present = is_present;

        // faqat yuborilgan bo‘lsa yangilaymiz; yuborilmasa eski qiymat qoladi
        if (rec.hasOwnProperty("come_time")) existing.come_time = come_time;
        if (rec.hasOwnProperty("left_time")) existing.left_time = left_time;

        // worked_minutes ni doimiy boshqarish (is_present=false bo‘lsa 0)
        existing.worked_minutes = normalizedWorked;

        await existing.save();
        results.push(existing);
      } else {
        const instance = await WorkerAttendanceModel.create({
          worker_id,
          date,
          is_present,
          come_time: rec.hasOwnProperty("come_time") ? come_time : null,
          left_time: rec.hasOwnProperty("left_time") ? left_time : null,
          worked_minutes: normalizedWorked,
        });
        results.push(instance);
      }

      // fixed ishchilar uchun balansni o'zgartirish (faqat present flag o'zgarganda)
      if (worker.is_fixed) {
        const salary = parseFloat(worker.fixed_salary);
        let diff = 0;
        if (!oldPresent && is_present) diff = salary; // present bo‘ldi
        else if (oldPresent && !is_present) diff = -salary; // present bo‘lmay qoldi

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
    if (!startDate || !endDate) {
      throw new HttpException(
        400,
        req.mf("startDate and endDate are required")
      );
    }

    const workers = await WorkerModel.findAll({
      attributes: ["id", "fullname"],
    });

    const attendances = await WorkerAttendanceModel.findAll({
      where: { date: { [Op.between]: [startDate, endDate] } },
      attributes: [
        "id",
        "worker_id",
        "date",
        "is_present",
        "come_time",
        "left_time",
        "worked_minutes",
      ],
    });

    const dates = [];
    for (
      let d = new Date(startDate);
      d <= new Date(endDate);
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(d.toISOString().split("T")[0]);
    }

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
          come_time: rec ? rec.come_time : null,
          left_time: rec ? rec.left_time : null,
          worked_minutes: rec ? rec.worked_minutes : 0,
        };
      }),
    }));

    res.status(200).send(result);
  };

  /** Get attendance for single worker */
  getByDateRangeByWorkerId = async (req, res, next) => {
    const { workerId, startDate, endDate } = req.body;
    if (!workerId || !startDate || !endDate) {
      throw new HttpException(
        400,
        req.mf("workerId, startDate and endDate are required")
      );
    }

    const attendances = await WorkerAttendanceModel.findAll({
      where: {
        worker_id: workerId,
        date: { [Op.between]: [startDate, endDate] },
      },
      attributes: [
        "date",
        "is_present",
        "come_time",
        "left_time",
        "worked_minutes",
      ],
    });

    const map = {};
    attendances.forEach((a) => {
      map[a.date] = {
        is_present: a.is_present,
        come_time: a.come_time,
        left_time: a.left_time,
        worked_minutes: a.worked_minutes,
      };
    });

    const result = [];
    for (
      let d = new Date(startDate);
      d <= new Date(endDate);
      d.setDate(d.getDate() + 1)
    ) {
      const date = d.toISOString().split("T")[0];
      const rec = map[date] || null;
      result.push({
        date,
        is_present: rec ? rec.is_present : false,
        come_time: rec ? rec.come_time : null,
        left_time: rec ? rec.left_time : null,
        worked_minutes: rec ? rec.worked_minutes : 0,
      });
    }

    res.status(200).send(result);
  };
}

module.exports = new WorkerAttendanceController();
