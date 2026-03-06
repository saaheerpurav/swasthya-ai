const { validationError } = require('../utils/response');

/**
 * Middleware factory: validates req.body against a Zod schema.
 * Usage: router.post('/foo', validate(MySchema), handler)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return validationError(res, 'Validation failed', details);
  }
  req.body = result.data;
  next();
};

/**
 * Validates req.query against a Zod schema.
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return validationError(res, 'Invalid query parameters', details);
  }
  req.query = result.data;
  next();
};

module.exports = { validate, validateQuery };
