const success = (res, data, status = 200) => {
  return res.status(status).json({ ok: true, data });
};

const paginated = (res, items, total, page, limit) => {
  return res.status(200).json({
    ok: true,
    data: {
      items,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    },
  });
};

const error = (res, code, message, status = 400, details = undefined) => {
  const body = { ok: false, error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return res.status(status).json(body);
};

const notFound = (res, message = 'Resource not found') =>
  error(res, 'NOT_FOUND', message, 404);

const unauthorized = (res, message = 'Unauthorized') =>
  error(res, 'UNAUTHORIZED', message, 401);

const forbidden = (res, message = 'Forbidden') =>
  error(res, 'FORBIDDEN', message, 403);

const validationError = (res, message, details) =>
  error(res, 'VALIDATION_ERROR', message, 400, details);

const internalError = (res, message = 'Internal server error') =>
  error(res, 'INTERNAL_ERROR', message, 500);

module.exports = { success, paginated, error, notFound, unauthorized, forbidden, validationError, internalError };
