import { TransportOption } from '../models/TransportOption.js';
import { AccommodationOption } from '../models/AccommodationOption.js';
import { ActivityOption } from '../models/ActivityOption.js';

export const getTransportOptions = async (req, res, next) => {
  try {
    const { origin, destination, mode, comfortLevel, maxPrice } = req.query;
    const query = {};

    if (origin) query.origin = { $regex: origin, $options: 'i' };
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (mode) query.mode = { $regex: mode, $options: 'i' };
    if (comfortLevel) query.comfortLevel = comfortLevel;
    if (maxPrice) query.price = { $lte: Number(maxPrice) };

    const transports = await TransportOption.find(query).sort({ price: 1 });

    return res.status(200).json({
      status: 'success',
      count: transports.length,
      data: transports,
    });
  } catch (error) {
    next(error);
  }
};

export const getAccommodationOptions = async (req, res, next) => {
  try {
    const { destination, category, minRating, maxPrice } = req.query;
    const query = {};

    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (category) query.category = category;
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (maxPrice) query.pricePerNight = { $lte: Number(maxPrice) };

    const accommodations = await AccommodationOption.find(query).sort({ rating: -1, pricePerNight: 1 });

    return res.status(200).json({
      status: 'success',
      count: accommodations.length,
      data: accommodations,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityOptions = async (req, res, next) => {
  try {
    const { destination, category, maxPrice } = req.query;
    const query = {};

    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (category) query.category = category;
    if (maxPrice) query.price = { $lte: Number(maxPrice) };

    const activities = await ActivityOption.find(query).sort({ rating: -1, price: 1 });

    return res.status(200).json({
      status: 'success',
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
