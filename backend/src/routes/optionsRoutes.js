import { Router } from 'express';
import {
  getTransportOptions,
  getAccommodationOptions,
  getActivityOptions,
} from '../controllers/optionsController.js';

const router = Router();

router.get('/transport', getTransportOptions);
router.get('/accommodations', getAccommodationOptions);
router.get('/activities', getActivityOptions);

export default router;
