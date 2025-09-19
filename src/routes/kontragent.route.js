const express = require("express");
const router = express.Router();
const KontragentController = require("../controllers/kontragent.controller");
const kontragentReport = require("../controllers/kontragent.report");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");
const joiMiddleware = require("../middleware/joi.middleware");
const {
  kontragentSchemas,
} = require("../middleware/validators/kontragentValidator.middleware");

// Get all kontragents
router.get("/", auth(), awaitHandlerFactory(KontragentController.getAll));
router.post(
  "/report",
  auth(),
  awaitHandlerFactory(kontragentReport.getKontragentReport)
);
// Get a kontragent by ID
router.get(
  "/id/:id",
  auth(),
  awaitHandlerFactory(KontragentController.getById)
);

// Create a new kontragent
router.post(
  "/",
  auth(),
  joiMiddleware(kontragentSchemas.create),
  awaitHandlerFactory(KontragentController.create)
);
// router.post('/payment', auth(),  awaitHandlerFactory(KontragentController.payment));
// Update a kontragent
router.patch(
  "/id/:id",
  auth(),
  joiMiddleware(kontragentSchemas.update),
  awaitHandlerFactory(KontragentController.update)
);

// Delete a kontragent
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(KontragentController.delete)
);

module.exports = router;
