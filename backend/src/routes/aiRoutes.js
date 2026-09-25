import { Router } from 'express';
import { handleAIChat, handleExtractIntent } from '../controllers/aiController.js';

const router = Router();

// Chat & conversational replanning
router.post('/chat', handleAIChat);

// Intent extraction
router.post('/intent', handleExtractIntent);

export default router;
