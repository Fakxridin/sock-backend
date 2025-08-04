const express = require("express");
const router = express.Router();
const AverloController = require("../controllers/averlo.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get all averlo entries
router.get("/", auth(), awaitHandlerFactory(AverloController.getAll));

// Get averlo by ID
router.get("/id/:id", auth(), awaitHandlerFactory(AverloController.getById));

// Create new averlo
router.post("/", auth(), awaitHandlerFactory(AverloController.create));

// Update averlo
router.patch("/id/:id", auth(), awaitHandlerFactory(AverloController.update));

// Delete averlo
router.delete("/id/:id", auth(), awaitHandlerFactory(AverloController.delete));

module.exports = router;
