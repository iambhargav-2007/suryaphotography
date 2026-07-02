import express from 'express';
import { 
  getDashboardSummary,
  getMonthlyCalendar,
  getCalendarDate,
  blockSlot,
  unblockSlot,
  getBookingDetails,
  cancelBooking
} from '../controllers/adminController.js';
import { loginAdmin } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Admin Route
router.post('/login', loginAdmin);

// Protected Admin Routes
router.use(protect);

// Dashboard
router.get('/dashboard', getDashboardSummary);

// Calendar
router.get('/calendar', getMonthlyCalendar);
router.get('/calendar/:date', getCalendarDate);

// Slot Management
router.post('/block-slot', blockSlot);
router.delete('/unblock-slot', unblockSlot);

// Bookings
router.get('/bookings/:bookingId', getBookingDetails);
router.delete('/bookings/:bookingId', cancelBooking);

export default router;
