const express = require("express");
const router = express.Router();
const KursController = require("../controllers/kurs.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");
// Uncomment and adapt if you add Joi validation schemas for kurs
// const joiMiddleware = require('../middleware/joi.middleware');
// const { kursSchemas } = require('../middleware/validators/kursValidator.middleware');

// GET all kurs
router.get("/", auth(), awaitHandlerFactory(KursController.getAll));

// GET a single kurs by ID
router.get("/id/:id", auth(), awaitHandlerFactory(KursController.getById));

// CREATE a new kurs
router.post(
  "/",
  auth(),
  // joiMiddleware(kursSchemas.create),
  awaitHandlerFactory(KursController.create)
);

// UPDATE an existing kurs
router.patch(
  "/id/:id",
  auth(),
  // joiMiddleware(kursSchemas.update),
  awaitHandlerFactory(KursController.update)
);
router.post("/range", auth(), awaitHandlerFactory(KursController.filterByDate));
router.get("/latest", auth(), awaitHandlerFactory(KursController.latest));

// DELETE a kurs
router.delete("/id/:id", auth(), awaitHandlerFactory(KursController.delete));

module.exports = router;
