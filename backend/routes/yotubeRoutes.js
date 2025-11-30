// routes/youtubeRoutes.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkCampaignHashtag } from '../controllers/youtubeController.js';

const router = express.Router();

// POST /api/youtube/check-hashtag
router.post('/check-hashtag', protect, checkCampaignHashtag);

export default router;