// routes/kontragentShablon.route.js
const express = require("express");
const router = express.Router();
const KontragentShablonController = require("../controllers/kontragent-shablon.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get kontragent-shablon by ID
router.get(
  "/id/:id",
  auth(),
  awaitHandlerFactory(KontragentShablonController.getById)
);

// Get all type = take
router.get(
  "/take",
  auth(),
  awaitHandlerFactory(KontragentShablonController.getAllTake)
);

// Get all type = give
router.get(
  "/give",
  auth(),
  awaitHandlerFactory(KontragentShablonController.getAllGive)
);

// Create kontragent-shablon
router.post(
  "/",
  auth(),
  awaitHandlerFactory(KontragentShablonController.create)
);

// Update kontragent-shablon
router.patch(
  "/id/:id",
  auth(),
  awaitHandlerFactory(KontragentShablonController.update)
);

// Delete kontragent-shablon
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(KontragentShablonController.delete)
);

module.exports = router;
