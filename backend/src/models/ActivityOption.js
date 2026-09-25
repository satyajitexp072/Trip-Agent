import mongoose from 'mongoose';

export const ActivityOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Sightseeing', 'Adventure', 'Food & Nightlife', 'Nature', 'Cultural', 'Wellness', 'Cruise'],
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    includes: {
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

export const ActivityOption = mongoose.model('ActivityOption', ActivityOptionSchema);
export default ActivityOption;
