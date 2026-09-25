import { Router } from 'express';
import {
  getBookingOptions,
  initiateHandover,
  getPartnerProgram,
  createSession,
  getSession,
  verifyTransportEndpoint,
  verifyAccommodationEndpoint,
  verifyActivityEndpoint,
  verifyLocalTransportEndpoint,
  processPaymentEndpoint,
  confirmBookingEndpoint,
  getBookedTripsEndpoint,
  getBookedTripByIdEndpoint,
} from '../controllers/bookingController.js';

const router = Router();

// Partner Program Info for "For travel businesses"
router.get('/partner-program', getPartnerProgram);

// Structured bookable options for a trip
router.get('/options/:tripId', getBookingOptions);

// Partner handover flow (Traveler -> Trip Agent -> Partner -> Booking -> Commission)
router.post('/handover', initiateHandover);

// ==========================================
// CHECKOUT & BOOKING WIZARD ENDPOINTS
// ==========================================

// Confirmed bookings list & lookup
router.get('/confirmed', getBookedTripsEndpoint);
router.get('/confirmed/:bookingId', getBookedTripByIdEndpoint);

// Session management
router.post('/session', createSession);
router.get('/session/:id', getSession);

// Step verifications
router.post('/session/:id/verify-transport', verifyTransportEndpoint);
router.post('/session/:id/verify-accommodation', verifyAccommodationEndpoint);
router.post('/session/:id/verify-activity', verifyActivityEndpoint);
router.post('/session/:id/verify-local-transport', verifyLocalTransportEndpoint);

// Payment & Confirmation
router.post('/session/:id/payment', processPaymentEndpoint);
router.post('/session/:id/confirm', confirmBookingEndpoint);

export default router;

