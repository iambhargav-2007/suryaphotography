import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';

const SLOTS = ['6PM', '7PM', '8PM', '9PM'];

export const calculateUpcomingAvailability = async () => {
  // Generate the next 20 days for the upcoming availability summary
  const upcomingDates = [];
  const today = new Date();
  
  for (let i = 0; i < 20; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    upcomingDates.push(d.toISOString().split('T')[0]); // Format: YYYY-MM-DD
  }

  // Fetch all active bookings in these dates
  const bookings = await Booking.find({ 
    date: { $in: upcomingDates },
    status: { $ne: 'cancelled' }
  });

  const availability = upcomingDates.map(date => {
    const bookedCount = bookings.filter(b => b.date === date).length;
    return {
      date,
      booked: bookedCount
    };
  });

  return availability;
};

export const calculateDateAvailability = async (date) => {
  // Fetch active bookings and blocks for the specific date
  const bookings = await Booking.find({ date, status: { $ne: 'cancelled' } });
  const blocks = await BlockedSlot.find({ date });

  const bookedSlots = bookings.filter(b => b.status === 'confirmed').map(b => b.slot);
  const pendingSlots = bookings.filter(b => b.status === 'pending').map(b => b.slot);
  const blockedSlots = blocks.map(b => b.slot);

  const slotAvailability = SLOTS.map(slot => {
    let status = 'AVAILABLE';
    
    if (blockedSlots.includes(slot)) {
      status = 'BLOCKED';
    } else if (bookedSlots.includes(slot)) {
      status = 'BOOKED';
    } else if (pendingSlots.includes(slot)) {
      status = 'PENDING';
    }

    return {
      slot,
      status
    };
  });

  return slotAvailability;
};
