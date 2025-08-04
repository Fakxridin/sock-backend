const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unit.controller');
const auth = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const joiMiddleware = require('../middleware/joi.middleware');
const { unitSchemas } = require('../middleware/validators/unitValidator.middleware');

// Get all units
router.get('/', auth(), awaitHandlerFactory(unitController.getAll));

// Get a unit by ID
router.get('/id/:id', auth(), awaitHandlerFactory(unitController.getById));

// Create a unit
router.post('/', auth(), joiMiddleware(unitSchemas.create), awaitHandlerFactory(unitController.create));

// Update a unit
router.patch('/id/:id', auth(), joiMiddleware(unitSchemas.update), awaitHandlerFactory(unitController.update));

// Delete a unit
router.delete('/id/:id', auth(), awaitHandlerFactory(unitController.delete));

module.exports = router;
