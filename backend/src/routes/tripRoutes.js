import { Router } from 'express';
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  calculateAdHocEstimate,
  generateBudgetEstimate,
  selectTripTier,
  optimizeTripEndpoint,
} from '../controllers/tripController.js';
import { getBookedTripsEndpoint, getBookedTripByIdEndpoint } from '../controllers/bookingController.js';

const router = Router();

// Ad-hoc budget discovery estimation & trip optimization
router.post('/estimate', calculateAdHocEstimate);
router.post('/optimize', optimizeTripEndpoint);

// Confirmed Booked Trips
router.get('/booked', getBookedTripsEndpoint);
router.get('/booked/:bookingId', getBookedTripByIdEndpoint);

router.route('/')
  .post(createTrip)
  .get(getTrips);

// Specific trip budget calculation, tier selection & optimization
router.post('/:id/budget-estimate', generateBudgetEstimate);
router.post('/:id/select-tier', selectTripTier);
router.post('/:id/optimize', optimizeTripEndpoint);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

export default router;


