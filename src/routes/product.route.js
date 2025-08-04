const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const joiMiddleware = require('../middleware/joi.middleware');
const { productSchemas } = require('../middleware/validators/productValidator.middleware');

// Get all products
router.get('/', auth(), awaitHandlerFactory(productController.getAll));

// Get a product by ID
router.get('/id/:id', auth(), awaitHandlerFactory(productController.getById));

// Create a new product
router.post('/', auth(), joiMiddleware(productSchemas.create), awaitHandlerFactory(productController.create));

// Update a product
router.patch('/id/:id', auth(), joiMiddleware(productSchemas.update), awaitHandlerFactory(productController.update));

// Delete a product
router.delete('/id/:id', auth(), awaitHandlerFactory(productController.delete));

module.exports = router;
