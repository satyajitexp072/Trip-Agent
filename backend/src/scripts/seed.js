import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { Destination } from '../models/Destination.js';
import { TransportOption } from '../models/TransportOption.js';
import { AccommodationOption } from '../models/AccommodationOption.js';
import { ActivityOption } from '../models/ActivityOption.js';
import {
  seedDestinations,
  seedTransportOptions,
  seedAccommodations,
  seedActivities
} from '../data/seedData.js';

dotenv.config();

const runSeed = async () => {
  console.log('--- Trip Agent: Seeding Travel Domain Database ---');

  const connected = await connectDB();
  if (!connected) {
    console.error('Database connection failed. Ensure MongoDB is running or MONGODB_URI is set.');
    process.exit(1);
  }

  try {
    // 1. Clear existing demo collections
    await Destination.deleteMany({ isDemoData: true });
    await TransportOption.deleteMany({ isDemoData: true });
    await AccommodationOption.deleteMany({ isDemoData: true });
    await ActivityOption.deleteMany({ isDemoData: true });

    // 2. Insert Seed Data
    const destinations = await Destination.insertMany(seedDestinations);
    console.log(`✓ Seeded ${destinations.length} Destinations (${destinations.map(d => d.name).join(', ')})`);

    const transports = await TransportOption.insertMany(seedTransportOptions);
    console.log(`✓ Seeded ${transports.length} Transport Options`);

    const accommodations = await AccommodationOption.insertMany(seedAccommodations);
    console.log(`✓ Seeded ${accommodations.length} Accommodation Options`);

    const activities = await ActivityOption.insertMany(seedActivities);
    console.log(`✓ Seeded ${activities.length} Activity Options`);

    console.log('--- Seeding completed successfully! ---');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runSeed();
