// routes/markedCost.routes.js

const express = require("express");
const router = express.Router();
const MarkedCostController = require("../controllers/marked_costs.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");
// Uncomment and adapt if you add Joi validation schemas for marked_costs
// const joiMiddleware = require('../middleware/joi.middleware');
// const { markedCostSchemas } = require('../middleware/validators/markedCostValidator.middleware');

// GET a single marked_cost by ID
router.get(
  "/id/:id",
  auth(),
  awaitHandlerFactory(MarkedCostController.getById)
);

// UPDATE an existing marked_cost
router.patch(
  "/id/:id",
  auth(),
  // joiMiddleware(markedCostSchemas.update),
  awaitHandlerFactory(MarkedCostController.update)
);

module.exports = router;
