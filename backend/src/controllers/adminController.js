import { fetchDashboardData } from '../services/dashboardService.js';
import { fetchMonthlyCalendar, fetchDateSlots } from '../services/calendarService.js';
import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';
import { sendEmail } from '../services/emailService.js';

// Helper: create error with status attached (Express 5 compatible)
const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

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

  if (!date || !slot) throw createError('Date and slot are required', 400);

  const isBooked = await Booking.findOne({ date, slot, status: { $ne: 'cancelled' } });
  if (isBooked) throw createError('Cannot block a slot that is already booked', 409);

  const isBlocked = await BlockedSlot.findOne({ date, slot });
  if (isBlocked) throw createError('Slot is already blocked', 409);

  const blockedSlot = await BlockedSlot.create({ date, slot, reason });
  res.status(201).json({ success: true, blockedSlot });
};

// @desc    Unblock a slot
// @route   DELETE /api/admin/unblock-slot
export const unblockSlot = async (req, res) => {
  const { date, slot } = req.body;

  if (!date || !slot) throw createError('Date and slot are required', 400);

  const deleted = await BlockedSlot.findOneAndDelete({ date, slot });
  if (!deleted) throw createError('Blocked slot not found', 404);

  res.json({ success: true, message: 'Slot unblocked successfully' });
};

// @desc    Get booking details
// @route   GET /api/admin/bookings/:bookingId
export const getBookingDetails = async (req, res) => {
  const { bookingId } = req.params;
  
  const booking = await Booking.findOne({ bookingId });
  if (!booking) throw createError('Booking not found', 404);

  res.json(booking);
};

// @desc    Cancel a booking (Reject)
// @route   DELETE /api/admin/bookings/:bookingId
export const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOneAndDelete({ bookingId });
  if (!booking) throw createError('Booking not found', 404);

  // Send rejection email (non-blocking)
  sendEmail(
    booking.email,
    'Your Booking Request was Cancelled - Surya Photography',
    `Hi ${booking.name},\n\nWe regret to inform you that your booking request for ${booking.date} at ${booking.slot} has been cancelled.\n\nIf you have any questions, please reply to this email.\n\nBest,\nSurya Photography`
  ).catch(err => console.error('Email send error:', err));

  res.json({ success: true, message: 'Booking cancelled successfully' });
};

// @desc    Accept a booking
// @route   PUT /api/admin/bookings/:bookingId/accept
export const acceptBooking = async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOneAndUpdate(
    { bookingId },
    { status: 'confirmed' },
    { new: true }
  );

  if (!booking) throw createError('Booking not found', 404);

  // Send acceptance email (non-blocking)
  sendEmail(
    booking.email,
    'Your Booking is Confirmed! - Surya Photography',
    `Hi ${booking.name},\n\nGreat news! Your booking for ${booking.date} at ${booking.slot} has been confirmed.\n\nWe look forward to seeing you.\n\nBest,\nSurya Photography`
  ).catch(err => console.error('Email send error:', err));

  res.json({ success: true, message: 'Booking accepted successfully', booking });
};

