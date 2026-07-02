import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    year: { type: String, required: true },
    branch: { type: String, required: true },
    preferredLocation: { type: String, required: true },
    notes: { type: String },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    status: { 
      type: String, 
      required: true, 
      enum: ['pending', 'confirmed', 'cancelled'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
