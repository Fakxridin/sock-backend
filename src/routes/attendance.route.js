const express = require("express");
const router = express.Router();
const WorkerAttendanceController = require("../controllers/attendance.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

/**
 * Upsert attendance records (bulk)Q
 * POST /attendance
 * Body: [{ worker_id, date, is_present }, ...]
 */
router.post(
  "/",
  auth(),
  awaitHandlerFactory(WorkerAttendanceController.upsertBulk)
);

/**
 * Get attendance for all workers in date range
 * GET /attendance?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
router.post(
  "/by-range",
  auth(),
  awaitHandlerFactory(WorkerAttendanceController.getByDateRange)
);

/**
 * Get attendance for a single worker in date range
 * GET /attendance/by-worker?workerId=ID&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
router.post(
  "/by-worker",
  auth(),
  awaitHandlerFactory(WorkerAttendanceController.getByDateRangeByWorkerId)
);

module.exports = router;
