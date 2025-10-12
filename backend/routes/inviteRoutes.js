import express from 'express';
import { createInvite, updateInviteStatus } from '../controllers/inviteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
const router = express.Router();

// Agora a importação de 'createInvite' funcionará corretamente
router.post('/', protect, createInvite);
router.route('/:id/status').patch(protect, updateInviteStatus);

export default router;