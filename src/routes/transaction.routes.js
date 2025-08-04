const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/transaction.controller");
const auth = require("../middleware/auth.middleware");
const awaitHandlerFactory = require("../middleware/awaitHandlerFactory.middleware");

// Get all transactions
router.get("/", auth(), awaitHandlerFactory(TransactionController.getAll));
router.get(
  "/from-sklad1",
  auth(),
  awaitHandlerFactory(TransactionController.getFromSklad1)
);
router.get(
  "/to-sklad1",
  auth(),
  awaitHandlerFactory(TransactionController.getFromSklad2)
);
// Get transaction by ID
router.get(
  "/id/:id",
  auth(),
  awaitHandlerFactory(TransactionController.getById)
);

// Create transaction
router.post("/", auth(), awaitHandlerFactory(TransactionController.create));

// Update transaction
router.patch(
  "/id/:id",
  auth(),
  awaitHandlerFactory(TransactionController.update)
);

// Delete transaction
router.delete(
  "/id/:id",
  auth(),
  awaitHandlerFactory(TransactionController.delete)
);

// Approve transaction
router.post(
  "/approve",
  auth(),
  awaitHandlerFactory(TransactionController.approve)
);

// Reject transaction
router.post(
  "/reject",
  auth(),
  awaitHandlerFactory(TransactionController.reject)
);

module.exports = router;
