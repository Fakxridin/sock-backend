const express = require("express");
const router = express.Router();
const UpakovkaController = require("../controllers/upakovka.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");
const joiMiddleware = require("../middleware/joi.middleware");

// Get all tikish entries
router.get("/", auth(), awaitHandlerFactory(UpakovkaController.getAll));

// Get tikish by ID
router.get("/id/:id", auth(), awaitHandlerFactory(UpakovkaController.getById));

// Create new tikish
router.post(
  "/",
  auth(),

  awaitHandlerFactory(UpakovkaController.create)
);

// Update tikish
router.patch(
  "/id/:id",
  auth(),

  awaitHandlerFactory(UpakovkaController.update)
);

// Delete tikish
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(UpakovkaController.delete)
);

module.exports = router;
