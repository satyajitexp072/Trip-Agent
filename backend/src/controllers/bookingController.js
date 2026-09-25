import {
  getTripBookingOptions,
  initiatePartnerHandover,
  getPartnerProgramInfo,
  createOrGetBookingSession,
  getBookingSession,
  verifyTransport,
  verifyAccommodation,
  verifyActivity,
  verifyLocalTransport,
  processDummyPayment,
  confirmBooking,
  getBookedTrips,
  getBookedTripById,
} from '../services/booking.service.js';

/**
 * GET /api/bookings/options/:tripId
 * Returns structured bookable/demo options for a trip
 * Supports category query: ?category=transport|accommodation|activities|tours|experiences|all
 */
export const getBookingOptions = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { category } = req.query;

    const result = await getTripBookingOptions(tripId, { category });

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/handover
 * Generates partner affiliate handover payload for:
 * Traveler -> Trip Agent -> Partner -> Booking -> Commission
 */
export const initiateHandover = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const result = await initiatePartnerHandover(payload);

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/partner-program
 * Returns business value proposition for "For travel businesses" concept section
 */
export const getPartnerProgram = async (req, res, next) => {
  try {
    const info = getPartnerProgramInfo();

    return res.status(200).json({
      status: 'success',
      data: info,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/session
 * Creates or retrieves a booking session for a trip (idempotent)
 */
export const createSession = async (req, res, next) => {
  try {
    const { tripId, itinerary, intent } = req.body;
    if (!tripId) {
      return res.status(400).json({
        status: 'fail',
        message: 'tripId is required to start checkout.',
      });
    }

    const session = await createOrGetBookingSession(tripId, itinerary, intent);
    return res.status(200).json({
      status: 'success',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/session/:id
 * Retrieves current booking session
 */
export const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await getBookingSession(id);
    if (!session) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking session not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/session/:id/verify-transport
 * Confirms flight/transport and generates TA-FLT-XXXXX
 */
export const verifyTransportEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const session = await verifyTransport(id, updates);

    return res.status(200).json({
      status: 'success',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/session/:id/verify-accommodation
 * Confirms stay/hotel and generates TA-HOT-XXXXX
 */
export const verifyAccommodationEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const session = await verifyAccommodation(id, updates);

    return res.status(200).json({
      status: 'success',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/session/:id/verify-activity
 * Confirms individual activity by index and generates TA-ACT-XXXXX
 */
export const verifyActivityEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activityIndex, updates } = req.body;
    if (activityIndex === undefined) {
      return res.status(400).json({
        status: 'fail',
        message: 'activityIndex is required.',
      });
    }

    const session = await verifyActivity(id, activityIndex, updates || {});

    return res.status(200).json({
      status: 'success',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/session/:id/verify-local-transport
 * Acknowledges local transport allowance
 */
export const verifyLocalTransportEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await verifyLocalTransport(id);

    return res.status(200).json({
      status: 'success',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/session/:id/payment
 * Processes simulated dummy payment
 */
export const processPaymentEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentData = req.body || {};
    const session = await processDummyPayment(id, paymentData);

    return res.status(200).json({
      status: 'success',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/session/:id/confirm
 * Finalizes all bookings into CONFIRMED state (idempotent)
 */
export const confirmBookingEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const snapshotData = req.body || {};
    const confirmedBooking = await confirmBooking(id, snapshotData);

    return res.status(200).json({
      status: 'success',
      data: confirmedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/confirmed or GET /api/trips/booked
 * Returns all confirmed booked trips
 */
export const getBookedTripsEndpoint = async (req, res, next) => {
  try {
    const { userId, guestId } = req.query;
    const trips = await getBookedTrips({ userId, guestId });

    return res.status(200).json({
      status: 'success',
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/confirmed/:bookingId or GET /api/trips/booked/:bookingId
 * Returns a specific confirmed booking
 */
export const getBookedTripByIdEndpoint = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const trip = await getBookedTripById(bookingId);
    if (!trip) {
      return res.status(404).json({
        status: 'fail',
        message: 'Confirmed booking not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};
