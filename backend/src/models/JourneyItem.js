import mongoose from 'mongoose';

export const JourneyItemSchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    type: {
      type: String,
      required: true,
      enum: ['transport', 'accommodation', 'activity', 'food', 'leisure'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    startTime: {
      type: String, // e.g. "09:30 AM"
      default: '',
    },
    endTime: {
      type: String, // e.g. "11:30 AM"
      default: '',
    },
    duration: {
      type: String, // e.g. "2 hours"
      default: '',
    },
    estimatedCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      default: 'general',
    },
    provider: {
      type: String,
      default: '',
      trim: true,
    },
    bookingAvailable: {
      type: Boolean,
      default: false,
    },
    bookingUrl: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: true, timestamps: true }
);

export const JourneyItem = mongoose.model('JourneyItem', JourneyItemSchema);
export default JourneyItem;
