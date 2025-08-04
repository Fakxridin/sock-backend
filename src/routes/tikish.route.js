const express = require("express");
const router = express.Router();
const TikishController = require("../controllers/tikish.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");
const joiMiddleware = require("../middleware/joi.middleware");

// Get all tikish entries
router.get("/", auth(), awaitHandlerFactory(TikishController.getAll));

// Get tikish by ID
router.get("/id/:id", auth(), awaitHandlerFactory(TikishController.getById));

// Create new tikish
router.post(
  "/",
  auth(),

  awaitHandlerFactory(TikishController.create)
);

// Update tikish
router.patch(
  "/id/:id",
  auth(),

  awaitHandlerFactory(TikishController.update)
);

// Delete tikish
router.delete("/id/:id", auth(), awaitHandlerFactory(TikishController.delete));

module.exports = router;
