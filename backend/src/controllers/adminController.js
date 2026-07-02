import { fetchDashboardData } from '../services/dashboardService.js';
import { fetchMonthlyCalendar, fetchDateSlots } from '../services/calendarService.js';
import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';

// @desc    Get dashboard summary
// @route   GET /api/admin/dashboard
export const getDashboardSummary = async (req, res) => {
  const summary = await fetchDashboardData();
  res.json(summary);
};

// @desc    Get monthly calendar data
// @route   GET /api/admin/calendar
export const getMonthlyCalendar = async (req, res) => {
  const calendarData = await fetchMonthlyCalendar();
  res.json(calendarData);
};

// @desc    Get slot details for a specific date
// @route   GET /api/admin/calendar/:date
export const getCalendarDate = async (req, res) => {
  const { date } = req.params;
  const data = await fetchDateSlots(date);
  res.json(data);
};

// @desc    Block a slot
// @route   POST /api/admin/block-slot
export const blockSlot = async (req, res) => {
  const { date, slot, reason } = req.body;

  if (!date || !slot) {
    res.status(400);
    throw new Error('Date and slot are required');
  }

  // Check if already booked
  const isBooked = await Booking.findOne({ date, slot, status: { $ne: 'cancelled' } });
  if (isBooked) {
    res.status(409);
    throw new Error('Cannot block a slot that is already booked');
  }

  // Check if already blocked
  const isBlocked = await BlockedSlot.findOne({ date, slot });
  if (isBlocked) {
    res.status(409);
    throw new Error('Slot is already blocked');
  }

  const blockedSlot = await BlockedSlot.create({ date, slot, reason });
  res.status(201).json({ success: true, blockedSlot });
};

// @desc    Unblock a slot
// @route   DELETE /api/admin/unblock-slot
export const unblockSlot = async (req, res) => {
  const { date, slot } = req.body;

  if (!date || !slot) {
    res.status(400);
    throw new Error('Date and slot are required');
  }

  const deleted = await BlockedSlot.findOneAndDelete({ date, slot });
  if (!deleted) {
    res.status(404);
    throw new Error('Blocked slot not found');
  }

  res.json({ success: true, message: 'Slot unblocked successfully' });
};

// @desc    Get booking details
// @route   GET /api/admin/bookings/:bookingId
export const getBookingDetails = async (req, res) => {
  const { bookingId } = req.params;
  
  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.json(booking);
};

// @desc    Cancel a booking
// @route   DELETE /api/admin/bookings/:bookingId
export const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOneAndDelete({ bookingId });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.json({ success: true, message: 'Booking cancelled successfully' });
};
