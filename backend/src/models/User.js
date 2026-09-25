import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    authProvider: {
      type: String,
      default: 'local',
      enum: ['local', 'google', 'guest'],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['traveler', 'admin', 'partner'],
      default: 'traveler',
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
export default User;
