// middleware/joi.middleware.js

module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // Clean error messages
      const messages = error.details.map((detail) => detail.message);

      return res.status(400).json({
        error: true,
        error_code: 'VALIDATION_ERROR',
        message: messages.join(', '),
        data: null
      });
    }

    next();
  };
};
