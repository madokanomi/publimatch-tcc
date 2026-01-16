import express from 'express';
import { analyzeLink } from '../controllers/videoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota POST para analisar o link manual
router.post('/analyze-link', protect, analyzeLink);

export default router;