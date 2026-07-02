import { 
  calculateUpcomingAvailability, 
  calculateDateAvailability 
} from '../services/availabilityService.js';
import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';

// @desc    Get upcoming dates and booking counts
// @route   GET /api/bookings/availability
// @access  Public
export const getUpcomingAvailability = async (req, res) => {
  // Express 5 natively handles async errors
  const availability = await calculateUpcomingAvailability();
  res.json(availability);
};

// @desc    Get all 4 slots for a specific date
// @route   GET /api/bookings/availability/:date
// @access  Public
export const getDateAvailability = async (req, res) => {
  const { date } = req.params;
  const slots = await calculateDateAvailability(date);
  res.json(slots);
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req, res) => {
  const { name, phone, year, branch, preferredLocation, notes, date, slot } = req.body;

  // 1. Validation Logic
  if (!name || !phone || !year || !date || !slot) {
    res.status(400);
    throw new Error('Please provide all required fields (name, phone, year, date, slot)');
  }

  // Basic phone validation (at least 10 digits)
  const phoneRegex = /^[0-9+\-\s()]{10,}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400);
    throw new Error('Please provide a valid phone number');
  }

  const validSlots = ['6PM', '7PM', '8PM', '9PM'];
  if (!validSlots.includes(slot)) {
    res.status(400);
    throw new Error('Invalid slot. Must be one of: 6PM, 7PM, 8PM, 9PM');
  }

  // 2. Duplicate / Availability Checking
  const isBlocked = await BlockedSlot.findOne({ date, slot });
  if (isBlocked) {
    return res.status(409).json({ success: false, message: 'Slot unavailable (Blocked)' });
  }

  const isBooked = await Booking.findOne({ date, slot, status: { $ne: 'cancelled' } });
  if (isBooked) {
    return res.status(409).json({ success: false, message: 'Slot unavailable (Already Booked)' });
  }

  // 3. Auto-generate Unique Booking ID (Format: SP-1001)
  const lastBooking = await Booking.findOne().sort({ createdAt: -1 });
  let nextIdNumber = 1001;
  
  if (lastBooking && lastBooking.bookingId && lastBooking.bookingId.startsWith('SP-')) {
    const lastId = parseInt(lastBooking.bookingId.split('-')[1]);
    if (!isNaN(lastId)) {
      nextIdNumber = lastId + 1;
    }
  }
  const bookingId = `SP-${nextIdNumber}`;

  // 4. Create Booking
  const booking = await Booking.create({
    bookingId,
    name,
    phone,
    year,
    branch: branch || 'N/A', // Branch was not required in validation but passed in req
    preferredLocation: preferredLocation || 'N/A',
    notes: notes || '',
    date,
    slot,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    bookingId: booking.bookingId
  });
};
