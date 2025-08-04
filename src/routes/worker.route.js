const express = require("express");
const router = express.Router();
const WorkerController = require("../controllers/worker.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get all workers
router.get("/", auth(), awaitHandlerFactory(WorkerController.getAll));

// Get a worker by ID
router.get("/id/:id", auth(), awaitHandlerFactory(WorkerController.getById));

// Create a new worker
router.post("/", auth(), awaitHandlerFactory(WorkerController.create));

// Update a worker
router.patch("/id/:id", auth(), awaitHandlerFactory(WorkerController.update));

// Delete a worker
router.delete("/id/:id", auth(), awaitHandlerFactory(WorkerController.delete));

module.exports = router;
