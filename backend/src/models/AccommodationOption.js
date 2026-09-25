import mongoose from 'mongoose';

export const AccommodationOptionSchema = new mongoose.Schema(
  {
    name: {
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
    location: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 4.5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Hostel',
        'Boutique Hotel',
        'Beach Resort',
        'Mountain Resort',
        'Heritage Hotel',
        'Luxury Villa',
        'Homestay'
      ],
      index: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    distanceFromAttractions: {
      type: String,
      default: '',
      trim: true,
    },
    bookingAvailable: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: '',
    },
    isDemoData: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const AccommodationOption = mongoose.model('AccommodationOption', AccommodationOptionSchema);
export default AccommodationOption;
