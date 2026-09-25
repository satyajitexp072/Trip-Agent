import mongoose from 'mongoose';
import { JourneyItemSchema } from './JourneyItem.js';

export const BudgetTierEstimateSchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    perPerson: {
      type: Number,
      required: true,
      min: 0,
    },
    transportCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    accommodationCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    foodCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    activityCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    localTransportCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    tradeoffs: {
      type: [String],
      default: [],
    },
    inclusions: {
      type: [String],
      default: [],
    },
    selectedOptions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    comfortLevel: {
      type: String,
      default: '',
    },
  },
  { _id: false, strict: false }
);

export const ItineraryDaySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    estimatedSpend: {
      type: Number,
      default: 0,
      min: 0,
    },
    items: {
      type: [JourneyItemSchema],
      default: [],
    },
  },
  { _id: true }
);

export const TripSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      default: 'Custom Journey Plan',
      trim: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
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
    interests: {
      type: [String],
      default: [],
    },
    travelStyle: {
      type: String,
      default: 'Relaxed',
    },
    transportPreference: {
      type: String,
      default: 'Any',
    },
    accommodationPreference: {
      type: String,
      default: 'Boutique Hotel',
    },
    optionalBudget: {
      type: Number,
      default: null,
      min: 0,
    },
    selectedBudgetTier: {
      type: String,
      enum: [
        'cheapest', 'bestValue', 'comfortable', 'premium',
        'best-value', 'Best Value', 'Cheapest', 'Comfortable', 'Premium'
      ],
      default: 'bestValue',
    },
    budgetEstimate: {
      meta: { type: mongoose.Schema.Types.Mixed, default: null },
      cheapest: { type: BudgetTierEstimateSchema, default: null },
      bestValue: { type: BudgetTierEstimateSchema, default: null },
      comfortable: { type: BudgetTierEstimateSchema, default: null },
      premium: { type: BudgetTierEstimateSchema, default: null },
      constraintAnalysis: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    itinerary: {
      type: [ItineraryDaySchema],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Planned', 'Booked', 'Archived'],
      default: 'Draft',
      index: true,
    },
    bookingId: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export const Trip = mongoose.model('Trip', TripSchema);
export default Trip;
