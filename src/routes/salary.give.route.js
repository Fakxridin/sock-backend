const express = require("express");
const router = express.Router();
const SalaryGiveController = require("../controllers/salary.give.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get all workers
router.get("/", auth(), awaitHandlerFactory(SalaryGiveController.getAll));
router.get(
  "/by-worker/id/:id",
  auth(),
  awaitHandlerFactory(SalaryGiveController.getAll)
);
router.get(
  "/by-worker-range/id/:id",
  auth(),
  awaitHandlerFactory(SalaryGiveController.getByWorkerIdAndRange)
);

// Get a worker by ID
router.get(
  "/id/:id",
  auth(),
  awaitHandlerFactory(SalaryGiveController.getById)
);

// Create a new worker
router.post("/", auth(), awaitHandlerFactory(SalaryGiveController.create));

// Update a worker
router.patch(
  "/id/:id",
  auth(),
  awaitHandlerFactory(SalaryGiveController.update)
);

// Delete a worker
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(SalaryGiveController.delete)
);

module.exports = router;
