import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';

const SLOTS = ['6PM', '7PM', '8PM', '9PM'];

export const fetchMonthlyCalendar = async () => {
  // MVP: Fetches the next 30 days for calendar overview
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const bookings = await Booking.find({ date: { $in: dates }, status: { $ne: 'cancelled' } });
  const blocks = await BlockedSlot.find({ date: { $in: dates } });

  const monthlyData = dates.map(date => {
    const bookedCount = bookings.filter(b => b.date === date).length;
    const blockedCount = blocks.filter(b => b.date === date).length;
    
    return {
      date,
      booked: bookedCount,
      blocked: blockedCount
    };
  });

  return monthlyData;
};

export const fetchDateSlots = async (date) => {
  const bookings = await Booking.find({ date, status: { $ne: 'cancelled' } });
  const blocks = await BlockedSlot.find({ date });

  const slotsData = SLOTS.map(slot => {
    const booking = bookings.find(b => b.slot === slot);
    const block = blocks.find(b => b.slot === slot);

    if (booking) {
      return {
        slot,
        status: 'BOOKED',
        bookingId: booking.bookingId,
        name: booking.name,
        phone: booking.phone
      };
    } else if (block) {
      return {
        slot,
        status: 'BLOCKED',
        reason: block.reason || ''
      };
    } else {
      return {
        slot,
        status: 'AVAILABLE'
      };
    }
  });

  return {
    date,
    slots: slotsData
  };
};
