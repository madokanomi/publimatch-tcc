import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDashboardStats, getBarChartData, getLineChartData } from '../controllers/dashboardControllers.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/bar-chart', protect, getBarChartData);   // <--- Nova Rota
router.get('/line-chart', protect, getLineChartData); // <--- Nova Rota

export default router;