import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';

export const fetchDashboardData = async () => {
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's bookings
  const todayBookings = await Booking.find({ date: today, status: { $ne: 'cancelled' } });
  const todayBlocked = await BlockedSlot.find({ date: today });
  
  const todaySessionsCount = todayBookings.length;
  const blockedCount = todayBlocked.length;
  const availableSlots = 4 - (todaySessionsCount + blockedCount);

  // Fetch upcoming sessions (from tomorrow onwards)
  const upcomingSessionsCount = await Booking.countDocuments({
    date: { $gt: today },
    status: { $ne: 'cancelled' }
  });

  // MVP Mock: Assuming 400 per session
  const todayRevenue = todaySessionsCount * 400;

  // Fetch upcoming sessions details (next 5)
  const upcomingBookings = await Booking.find({
    date: { $gt: today },
    status: { $ne: 'cancelled' }
  }).sort({ date: 1 }).limit(5);

  const SLOTS = ['6PM', '7PM', '8PM', '9PM'];
  const todaySchedule = SLOTS.map(slot => {
    const booking = todayBookings.find(b => b.slot === slot);
    const block = todayBlocked.find(b => b.slot === slot);

    if (booking) {
      return { id: booking.bookingId, time: slot, name: booking.name, phone: booking.phone, status: 'booked' };
    } else if (block) {
      return { id: `blocked-${slot}`, time: slot, name: 'Blocked', phone: '', status: 'blocked' };
    } else {
      return { id: `avail-${slot}`, time: slot, name: 'Available', phone: '', status: 'available' };
    }
  });

  return {
    todaySessions: todaySessionsCount,
    availableSlots: availableSlots > 0 ? availableSlots : 0,
    upcomingSessions: upcomingSessionsCount,
    todayRevenue,
    todaySchedule,
    upcomingBookings: upcomingBookings.map(b => ({
      id: b.bookingId,
      date: b.date,
      time: b.slot,
      name: b.name,
      phone: b.phone
    }))
  };
};
