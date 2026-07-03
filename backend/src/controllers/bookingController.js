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
  const { name, email, phone, year, branch, preferredLocation, notes, date, slots } = req.body;

  // 1. Validation Logic
  if (!name || !email || !phone || !year || !date || !slots || !slots.length) {
    res.status(400);
    throw new Error('Please provide all required fields (name, email, phone, year, date, slots)');
  }

  // Basic phone validation (at least 10 digits)
  const phoneRegex = /^[0-9+\-\s()]{10,}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400);
    throw new Error('Please provide a valid phone number');
  }

  const validSlots = ['6PM', '7PM', '8PM', '9PM'];
  for (const slot of slots) {
    if (!validSlots.includes(slot)) {
      res.status(400);
      throw new Error(`Invalid slot: ${slot}. Must be one of: 6PM, 7PM, 8PM, 9PM`);
    }
  }

  // 2. Duplicate / Availability Checking
  for (const slot of slots) {
    const isBlocked = await BlockedSlot.findOne({ date, slot });
    if (isBlocked) {
      return res.status(409).json({ success: false, message: `Slot ${slot} unavailable (Blocked)` });
    }

    const isBooked = await Booking.findOne({ date, slot, status: { $ne: 'cancelled' } });
    if (isBooked) {
      return res.status(409).json({ success: false, message: `Slot ${slot} unavailable (Already Booked)` });
    }
  }

  // 3. Auto-generate Unique Booking IDs and Create Bookings
  const lastBooking = await Booking.findOne().sort({ createdAt: -1 });
  let nextIdNumber = 1001;
  
  if (lastBooking && lastBooking.bookingId && lastBooking.bookingId.startsWith('SP-')) {
    const lastId = parseInt(lastBooking.bookingId.split('-')[1]);
    if (!isNaN(lastId)) {
      nextIdNumber = lastId + 1;
    }
  }

  const createdBookings = [];
  const generatedBookingIds = [];

  for (const slot of slots) {
    const bookingId = `SP-${nextIdNumber++}`;
    generatedBookingIds.push(bookingId);
    
    createdBookings.push({
      bookingId,
      name,
      email,
      phone,
      year,
      branch: branch || 'N/A',
      preferredLocation: preferredLocation || 'N/A',
      notes: notes || '',
      date,
      slot,
      status: 'pending'
    });
  }

  // 4. Create Bookings in DB
  await Booking.insertMany(createdBookings);

  // 5. Send Slack Notification (if configured)
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const message = {
        text: `*New Booking Request!*\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone}\n*Year:* ${year}\n*Branch:* ${branch || 'N/A'}\n*Date:* ${date}\n*Slots:* ${slots.join(', ')}\n*Location:* ${preferredLocation || 'N/A'}\n*Notes:* ${notes || 'None'}\n\n<http://localhost:5173/admin/calendar|Review in Admin Dashboard to Accept/Reject>`
      };
      
      // Async request to Slack, don't wait for it to finish to respond to client
      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      }).catch(err => console.error('Slack webhook error:', err));
    } catch (err) {
      console.error('Failed to send slack notification', err);
    }
  }

  res.status(201).json({
    success: true,
    bookingIds: generatedBookingIds
  });
};
