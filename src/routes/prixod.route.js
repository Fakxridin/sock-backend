const express = require("express");
const router = express.Router();
const PrixodController = require("../controllers/prixod.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");
const joiMiddleware = require("../middleware/joi.middleware");
const { prixodSchemas } = require("../middleware/validators/prixod.validator");

// Get all prixod entries
router.get("/", auth(), awaitHandlerFactory(PrixodController.getAll));

// Get a prixod entry by ID
router.get("/id/:id", auth(), awaitHandlerFactory(PrixodController.getById));

// Create a new prixod entry
router.post(
  "/",
  auth(),
  joiMiddleware(prixodSchemas.create),
  awaitHandlerFactory(PrixodController.create)
);

// Update a prixod entry
router.patch(
  "/id/:id",
  auth(),
  joiMiddleware(prixodSchemas.update),
  awaitHandlerFactory(PrixodController.update)
);

// Delete a prixod entry
router.delete("/id/:id", auth(), awaitHandlerFactory(PrixodController.delete));

module.exports = router;
