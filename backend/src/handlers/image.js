const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { analyzeImage } = require('../services/imageService');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /v1/image/analyze
router.post('/analyze', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'VALIDATION_ERROR', 'No image file provided', 400);

    const language = req.body.language || 'en';
    const description = req.body.description?.slice(0, 500) || '';

    const result = await analyzeImage(req.file.buffer, language, description);

    if (result.imageQualityIssue) {
      return error(
        res,
        'IMAGE_QUALITY_INSUFFICIENT',
        result.imageQualityIssue,
        422
      );
    }

    return success(res, result);
  } catch (err) {
    console.error('[image] analyze error:', err);
    return error(res, 'INTERNAL_ERROR', 'Image analysis failed', 500);
  }
});

module.exports = router;
