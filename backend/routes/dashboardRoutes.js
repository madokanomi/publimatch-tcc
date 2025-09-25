// routes/dashboard.routes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/dashboardControllers.js';

const router = express.Router();

// This route is protected and will fetch the stats
router.get('/stats', protect, getDashboardStats);

export default router;