import { Destination } from '../models/Destination.js';
import { AccommodationOption } from '../models/AccommodationOption.js';
import { ActivityOption } from '../models/ActivityOption.js';

export const getDestinations = async (req, res, next) => {
  try {
    const { search, tag, state } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    const destinations = await Destination.find(query).sort({ name: 1 });

    return res.status(200).json({
      status: 'success',
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

export const getDestinationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let destination = null;

    // Check if valid ObjectId or search by slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      destination = await Destination.findById(id);
    }
    if (!destination) {
      destination = await Destination.findOne({ slug: id.toLowerCase() });
    }

    if (!destination) {
      return res.status(404).json({
        status: 'fail',
        message: `Destination not found for identifier: ${id}`,
      });
    }

    // Fetch related accommodations and activities
    const [accommodations, activities] = await Promise.all([
      AccommodationOption.find({ destination: destination.name }),
      ActivityOption.find({ destination: destination.name }),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        ...destination.toObject(),
        accommodations,
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};
