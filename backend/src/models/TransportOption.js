import mongoose from 'mongoose';

export const TransportOptionSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      required: true,
      enum: ['Flight', 'Train', 'Bus', 'Cab'],
      index: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    departure: {
      type: String,
      required: true,
    },
    arrival: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    comfortLevel: {
      type: String,
      enum: ['Budget', 'Standard', 'Premium', 'Luxury'],
      default: 'Standard',
      index: true,
    },
    stops: {
      type: Number,
      default: 0,
      min: 0,
    },
    flightOrTrainNumber: {
      type: String,
      default: '',
      trim: true,
    },
    details: {
      type: [String],
      default: [],
    },
    isDemoData: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const TransportOption = mongoose.model('TransportOption', TransportOptionSchema);
export default TransportOption;
