import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkCampaignHashtag, fetchVideoTranscript } from '../controllers/youtubeController.js';

const router = express.Router();

// POST /api/youtube/check-hashtag
router.post('/check-hashtag', protect, checkCampaignHashtag);

// POST /api/youtube/transcript
router.post('/transcript', protect, fetchVideoTranscript);

export default router;