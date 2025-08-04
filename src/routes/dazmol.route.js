const express = require("express");
const router = express.Router();
const DazmolController = require("../controllers/dazmol.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get all averlo entries
router.get("/", auth(), awaitHandlerFactory(DazmolController.getAll));

// Get averlo by ID
router.get("/id/:id", auth(), awaitHandlerFactory(DazmolController.getById));

// Create new averlo
router.post("/", auth(), awaitHandlerFactory(DazmolController.create));

// Update averlo
router.patch("/id/:id", auth(), awaitHandlerFactory(DazmolController.update));

// Delete averlo
router.delete("/id/:id", auth(), awaitHandlerFactory(DazmolController.delete));

module.exports = router;
