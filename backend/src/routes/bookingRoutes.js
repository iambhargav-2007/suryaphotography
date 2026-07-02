import express from 'express';
import { 
  getUpcomingAvailability, 
  getDateAvailability, 
  createBooking 
} from '../controllers/bookingController.js';

const router = express.Router();

// Public Routes
router.get('/availability', getUpcomingAvailability);
router.get('/availability/:date', getDateAvailability);
router.post('/', createBooking);

export default router;
