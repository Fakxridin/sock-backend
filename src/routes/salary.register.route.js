const express = require("express");
const router = express.Router();
const SalaryRegisterController = require("../controllers/salary.register.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get all workers
router.get("/", auth(), awaitHandlerFactory(SalaryRegisterController.getAll));
router.get(
  "/by-worker/id/:id",
  auth(),
  awaitHandlerFactory(SalaryRegisterController.getAll)
);
router.get(
  "/by-worker-range/id/:id",
  auth(),
  awaitHandlerFactory(SalaryRegisterController.getByWorkerIdAndRange)
);

// Get a worker by ID
router.get(
  "/id/:id",
  auth(),
  awaitHandlerFactory(SalaryRegisterController.getById)
);
router.post(
  "/all-number",
  auth(),
  awaitHandlerFactory(SalaryRegisterController.getByRangeForAllWorkers)
);
// Create a new worker
router.post("/", auth(), awaitHandlerFactory(SalaryRegisterController.create));

// Update a worker
router.patch(
  "/id/:id",
  auth(),
  awaitHandlerFactory(SalaryRegisterController.update)
);

// Delete a worker
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(SalaryRegisterController.delete)
);

module.exports = router;
