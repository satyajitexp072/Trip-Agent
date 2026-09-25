import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import destinationRoutes from './destinationRoutes.js';
import optionsRoutes from './optionsRoutes.js';
import tripRoutes from './tripRoutes.js';
import aiRoutes from './aiRoutes.js';
import bookingRoutes from './bookingRoutes.js';

const router = Router();

// System routes
router.use('/health', healthRoutes);

// Travel Catalog & Destination routes
router.use('/destinations', destinationRoutes);

// Options catalog (Transport, Accommodations, Activities)
router.use('/', optionsRoutes);

// Structured Trip Planning & Replanning routes
router.use('/trips', tripRoutes);

// AI Orchestration & Conversational Assistant routes
router.use('/ai', aiRoutes);

// Partner Booking & Monetization routes
router.use('/bookings', bookingRoutes);

export default router;
