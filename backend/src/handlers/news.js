'use strict';

const express = require('express');
const { success, error } = require('../utils/response');
const db = require('../db/client');

const router = express.Router();

// GET /v1/news
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);

    const result = await db.listNews({ page, limit });
    const items  = result?.items ?? result ?? [];
    const total  = result?.total ?? items.length;

    return success(res, { articles: items, total, page, hasMore: page * limit < total });
  } catch (err) {
    console.error('[news] error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch news', 500);
  }
});

module.exports = router;
