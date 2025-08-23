const express = require("express");
const router = express.Router();
const kontrangetpaycontroller = require("../controllers/kontragentpay.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get all kassa entries
router.get("/", auth(), awaitHandlerFactory(kontrangetpaycontroller.getAll));

// Get a kassa entry by ID
router.get(
  "/id/:id",
  auth(),
  awaitHandlerFactory(kontrangetpaycontroller.getById)
);

// Create a new kassa entry
router.post(
  "/",
  auth(),

  awaitHandlerFactory(kontrangetpaycontroller.create)
);

// Update a kassa entry
router.patch(
  "/id/:id",
  auth(),

  awaitHandlerFactory(kontrangetpaycontroller.update)
);

// Delete a kassa entry
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(kontrangetpaycontroller.delete)
);

module.exports = router;
