// routes/foodShablon.routes.js
const express = require("express");
const router = express.Router();
const CalculationController = require("../controllers/calculation.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");
const joiMiddleware = require("../middleware/joi.middleware");
const {
  CaclulationSchema,
} = require("../middleware/validators/calculation.validator");

// Get all templates
router.get("/", auth(), awaitHandlerFactory(CalculationController.getAll));
router.get(
  "/shablon-ingredients/:shablon_id",
  auth(),
  awaitHandlerFactory(CalculationController.getIngredientsByShablonId)
);
// Get a template by ID
router.get(
  "/id/:id",
  auth(),
  awaitHandlerFactory(CalculationController.getById)
);
// Get templates by category

// Create new template
router.post(
  "/",
  auth(),
  joiMiddleware(CaclulationSchema.create),
  awaitHandlerFactory(CalculationController.create)
);
// Update template
router.patch(
  "/id/:id",
  auth(),
  joiMiddleware(CaclulationSchema.update),
  awaitHandlerFactory(CalculationController.update)
);
// Delete template
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(CalculationController.delete)
);

module.exports = router;
