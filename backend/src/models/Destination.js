import mongoose from 'mongoose';

export const DestinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    heroImage: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      index: true,
      default: [],
    },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    typicalDailyCost: {
      budget: { type: Number, default: 2000 },
      moderate: { type: Number, default: 4500 },
      luxury: { type: Number, default: 12000 },
    },
    bestTimeToVisit: {
      type: String,
      default: 'Oct - Mar',
    },
    defaultDuration: {
      type: Number,
      default: 4,
    },
    isDemoData: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Destination = mongoose.model('Destination', DestinationSchema);
export default Destination;
