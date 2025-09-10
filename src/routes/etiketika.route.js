const express = require("express");
const router = express.Router();
const EtiketikaController = require("../controllers/etiketika.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get all averlo entries
router.get("/", auth(), awaitHandlerFactory(EtiketikaController.getAll));

// Get averlo by ID
router.get("/id/:id", auth(), awaitHandlerFactory(EtiketikaController.getById));

// Create new averlo
router.post("/", auth(), awaitHandlerFactory(EtiketikaController.create));

// Update averlo
router.patch(
  "/id/:id",
  auth(),
  awaitHandlerFactory(EtiketikaController.update)
);

// Delete averlo
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(EtiketikaController.delete)
);

module.exports = router;
