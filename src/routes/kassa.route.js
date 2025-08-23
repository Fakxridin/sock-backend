const express = require("express");
const router = express.Router();
const KassaController = require("../controllers/kassa.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get all kassa entries
router.get("/", auth(), awaitHandlerFactory(KassaController.getAll));

// Get a kassa entry by ID
router.get("/id/:id", auth(), awaitHandlerFactory(KassaController.getById));

// Create a new kassa entry
router.post(
  "/",
  auth(),

  awaitHandlerFactory(KassaController.create)
);

// Update a kassa entry
router.patch(
  "/id/:id",
  auth(),

  awaitHandlerFactory(KassaController.update)
);

// Delete a kassa entry
router.delete("/id/:id", auth(), awaitHandlerFactory(KassaController.delete));

module.exports = router;
