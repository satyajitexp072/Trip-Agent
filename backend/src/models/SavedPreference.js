import mongoose from 'mongoose';

export const SavedPreferenceSchema = new mongoose.Schema(
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
    travelerName: {
      type: String,
      default: 'Guest Traveler',
      trim: true,
    },
    homeAirport: {
      type: String,
      default: 'Bhubaneswar (BBI)',
      trim: true,
    },
    defaultTravelStyle: {
      type: String,
      enum: ['Relaxed', 'Balanced', 'Fast-Paced'],
      default: 'Relaxed',
    },
    preferredTier: {
      type: String,
      enum: ['cheapest', 'bestValue', 'comfortable', 'premium'],
      default: 'bestValue',
    },
    dietaryPreferences: {
      type: [String],
      default: ['Coastal & Seafood', 'Local Specialties'],
    },
    transitPreference: {
      type: String,
      default: 'Fastest with comfort (Flights / 1-stop)',
    },
    stayPreference: {
      type: String,
      default: 'Boutique 3-star to 4-star with swimming pool',
    },
    pacingPreference: {
      type: String,
      default: 'Max 2 core activities per day',
    },
  },
  { timestamps: true }
);

export const SavedPreference = mongoose.model('SavedPreference', SavedPreferenceSchema);
export default SavedPreference;
