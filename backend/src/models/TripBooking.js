import mongoose from 'mongoose';

export const BookingTransportSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'CONFIRMED'],
      default: 'PENDING',
    },
    reference: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    flightNumbers: {
      type: String,
      default: '',
    },
    departure: {
      type: String,
      default: '',
    },
    returnArrival: {
      type: String,
      default: '',
    },
    cabin: {
      type: String,
      default: 'Economy',
    },
    duration: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

export const BookingAccommodationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'CONFIRMED'],
      default: 'PENDING',
    },
    reference: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    roomType: {
      type: String,
      default: 'Standard / Deluxe Room',
    },
    nights: {
      type: Number,
      default: 1,
      min: 1,
    },
    checkIn: {
      type: String,
      default: '',
    },
    checkOut: {
      type: String,
      default: '',
    },
    pricePerNight: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

export const BookingActivityItemSchema = new mongoose.Schema(
  {
    activityId: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    dayNumber: {
      type: Number,
      default: 1,
    },
    date: {
      type: String,
      default: '',
    },
    time: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    travelers: {
      type: Number,
      default: 2,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'CONFIRMED'],
      default: 'PENDING',
    },
    reference: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

export const BookingLocalTransportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Local travel allowance',
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAllowance: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: 'Included in trip cost estimate; does not require external partner booking.',
    },
    status: {
      type: String,
      enum: ['INCLUDED', 'CONFIRMED'],
      default: 'INCLUDED',
    },
  },
  { _id: false }
);

export const TripBookingPaymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['PENDING', 'PAID_DEMO', 'FAILED'],
      default: 'PENDING',
    },
    transactionId: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    method: {
      type: String,
      enum: ['CARD', 'UPI', 'DEMO'],
      default: 'CARD',
    },
    cardholderName: {
      type: String,
      default: 'Demo Traveler',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    isSimulation: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

export const TripBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tripId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    guestId: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'IN_PROGRESS', 'PAYMENT_PENDING', 'CONFIRMED', 'FAILED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    travelers: {
      type: Number,
      required: true,
      min: 1,
    },
    travelDates: {
      start: { type: String, default: '' },
      end: { type: String, default: '' },
    },
    selectedBudgetTier: {
      type: String,
      default: 'bestValue',
    },
    confirmationNumber: {
      type: String,
      default: function () {
        return this.bookingId;
      },
      index: true,
    },
    tripTitle: {
      type: String,
      default: 'Custom Journey Plan',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    trackingRef: {
      type: String,
      default: '',
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    bookings: {
      transport: {
        type: BookingTransportSchema,
        default: () => ({}),
      },
      accommodation: {
        type: BookingAccommodationSchema,
        default: () => ({}),
      },
      activities: {
        type: [BookingActivityItemSchema],
        default: [],
      },
      localTransport: {
        type: BookingLocalTransportSchema,
        default: () => ({}),
      },
    },
    bookingItems: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    food: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    localTransit: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    itinerary: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    rawItinerarySnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    optimizationHistory: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    payment: {
      type: TripBookingPaymentSchema,
      default: () => ({}),
    },
    demoMode: {
      type: Boolean,
      default: true,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const TripBooking = mongoose.model('TripBooking', TripBookingSchema);
export default TripBooking;
