const { Op, fn, col } = require("sequelize");
const SalaryRegisterModel = require("../models/salary-register.model");
const WorkerModel = require("../models/worker.model");
const SalaryGiveModel = require("../models/salary_give.model"); // <<— YANGI
const HttpException = require("../utils/HttpException.utils");
const BaseController = require("./BaseController");
const WorkerAttendanceModel = require("../models/attendance.model");
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

  // ====== BY ID + RANGE ======
  getByWorkerIdAndRange = async (req, res, next) => {
    const { start_date, end_date, worker_id } = req.body;

    if (!start_date || !end_date) {
      throw new HttpException(400, "Start and End date are required");
    }

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

    // Totals by fields
    const totalTikishSoni = salaryRegisters.reduce(
      (acc, r) => acc + (r.tikish_soni || 0),
      0
    );
    const totalAverloSoni = salaryRegisters.reduce(
      (acc, r) => acc + (r.averlo_soni || 0),
      0
    );
    const totalDazmolSoni = salaryRegisters.reduce(
      (acc, r) => acc + (r.dazmol_soni || 0),
      0
    );
    const totalEtiketikaSoni = salaryRegisters.reduce(
      (acc, r) => acc + (r.etiketika_soni || 0),
      0
    );
    const totalUpakovkaSoni = salaryRegisters.reduce(
      (acc, r) => acc + (r.upakovka_soni || 0),
      0
    );

    // >>> YANGI: SalaryGive bo‘yicha shu intervalda ushbu ishchiga berilgan jami summa
    const paidSumRow = await SalaryGiveModel.findOne({
      attributes: [
        [fn("COALESCE", fn("SUM", col("total_som_summa")), 0), "total"],
      ],
      where: {
        worker_id,
        datetime: {
          [Op.between]: [new Date(start_date), new Date(end_date)],
        },
      },
      raw: true,
    });
    const totalPaidSom = Number(paidSumRow?.total || 0);

    const worker = salaryRegisters[0].worker;

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
        // >>> YANGI: shu oraliqda berilgan jami summa
        jami_berilgan_total_som_summa: totalPaidSom,
      },
    });
  };

  // ====== ALL + RANGE ======
  // ====== ALL + RANGE ======
  getByRangeForAllWorkers = async (req, res, next) => {
    try {
      let { start_date, end_date } = req.body;

      if (!start_date || !end_date) {
        throw new HttpException(400, "Start and End date are required");
      }

      // ---- Normalize: epoch(sec)/ms yoki ISO bo‘lishi mumkin
      const toDateObj = (v) => {
        if (typeof v === "number") {
          // epoch sekund bo‘lsa *1000, ms bo‘lsa to‘g‘ridan
          return String(v).length <= 10 ? new Date(v * 1000) : new Date(v);
        }
        return new Date(v);
      };
      const startObj = toDateObj(start_date);
      const endObj = toDateObj(end_date);

      // Attendance jadvalida date = 'YYYY-MM-DD' ko‘rinishida saqlanadi
      const toYMD = (d) => d.toISOString().slice(0, 10);
      const startYMD = toYMD(startObj);
      const endYMD = toYMD(endObj);

      // Kunlar massivini tayyorlab olamiz (inclusive)
      const makeDateList = (a, b) => {
        const out = [];
        const cur = new Date(a);
        const stop = new Date(b);
        while (cur <= stop) {
          out.push(cur.toISOString().slice(0, 10));
          cur.setDate(cur.getDate() + 1);
        }
        return out;
      };
      const allDates = makeDateList(startObj, endObj);
      const totalDays = allDates.length;

      // --- Barcha ishchilar
      const workers = await WorkerModel.findAll();

      // --- SalaryRegisters (shu oraliqda)
      const salaryRegisters = await SalaryRegisterModel.findAll({
        where: {
          datetime: {
            [Op.between]: [start_date, end_date],
          },
        },
        include: [{ model: WorkerModel, as: "worker" }],
        order: [["datetime", "ASC"]],
      });

      // --- SalaryGive bo‘yicha group by worker_id
      const giveTotals = await SalaryGiveModel.findAll({
        attributes: [
          "worker_id",
          [fn("COALESCE", fn("SUM", col("total_som_summa")), 0), "total_paid"],
        ],
        where: {
          datetime: {
            [Op.between]: [start_date, end_date],
          },
        },
        group: ["worker_id"],
        raw: true,
      });
      const paidByWorker = new Map(
        giveTotals.map((row) => [
          String(row.worker_id),
          Number(row.total_paid || 0),
        ])
      );

      // --- Attendance: shu oraliqdagi barcha yozuvlar
      // date ustuni 'YYYY-MM-DD' bo‘lgani uchun string bilan filter qilamiz
      const attendanceRows = await WorkerAttendanceModel.findAll({
        where: {
          date: { [Op.between]: [startYMD, endYMD] },
        },
        attributes: ["worker_id", "date", "is_present"],
        raw: true,
      });

      // worker_id => Set(presentDates)
      const presentDatesByWorker = new Map();
      for (const row of attendanceRows) {
        const wid = String(row.worker_id);
        if (row.is_present) {
          if (!presentDatesByWorker.has(wid))
            presentDatesByWorker.set(wid, new Set());
          presentDatesByWorker.get(wid).add(row.date);
        }
        // is_present=false yozuvi bo‘lsa ham kelgan hisoblanmaydi (absent).
        // Yo‘qligi ham absent — shuning uchun faqat true holatlarni qo‘shamiz.
      }

      // --- Har bir ishchi uchun aggregatsiya
      const workerTotals = {};

      // SalaryRegisters orqali ishlab chiqarish ko‘rsatkichlari yig‘iladi
      salaryRegisters.forEach((register) => {
        const workerId = String(register.worker.id);

        if (!workerTotals[workerId]) {
          workerTotals[workerId] = {
            worker: register.worker,
            // ishlab chiqarish sonlari
            tikish_soni: 0,
            averlo_soni: 0,
            dazmol_soni: 0,
            etiketika_soni: 0,
            upakovka_soni: 0,
            // finance
            berilgan_total_som_summa: 0,
            // attendance (to‘ldiramiz keyin)
            come_days: 0,
            missed_days: 0,
          };
        }

        workerTotals[workerId].tikish_soni += register.tikish_soni || 0;
        workerTotals[workerId].averlo_soni += register.averlo_soni || 0;
        workerTotals[workerId].dazmol_soni += register.dazmol_soni || 0;
        workerTotals[workerId].etiketika_soni += register.etiketika_soni || 0;
        workerTotals[workerId].upakovka_soni += register.upakovka_soni || 0;
      });

      // To‘lov yig‘indilarini qo‘shish
      Object.keys(workerTotals).forEach((wid) => {
        workerTotals[wid].berilgan_total_som_summa =
          paidByWorker.get(String(wid)) || 0;
      });

      // Ish haqida yozuvlari yo‘q ishchilar ham kelsin (nol bilan)
      workers.forEach((w) => {
        const wid = String(w.id);
        if (!workerTotals[wid]) {
          workerTotals[wid] = {
            worker: w,
            tikish_soni: 0,
            averlo_soni: 0,
            dazmol_soni: 0,
            etiketika_soni: 0,
            upakovka_soni: 0,
            berilgan_total_som_summa: paidByWorker.get(wid) || 0,
            come_days: 0,
            missed_days: 0,
          };
        }
      });

      // --- Attendance’ni hisoblash (kelgan/kelmagan kunlar)
      for (const w of workers) {
        const wid = String(w.id);
        const presentSet = presentDatesByWorker.get(wid) || new Set();
        const comeDays = presentSet.size; // faqat is_present=true bo‘lganlar
        const missedDays = Math.max(totalDays - comeDays, 0); // yo‘qligi yoki false — absent

        workerTotals[wid].come_days = comeDays;
        workerTotals[wid].missed_days = missedDays;
      }

      const result = Object.values(workerTotals);

      res.send(result);
    } catch (err) {
      next(err);
    }
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
