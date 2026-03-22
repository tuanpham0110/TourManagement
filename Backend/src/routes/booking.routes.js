import express from 'express';
import {
    createBooking,
    getBookingHistory,
    payBooking
} from '../controllers/booking.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.get('/history/:customerId', authMiddleware, getBookingHistory);
router.patch('/:bookingId/pay', authMiddleware, payBooking);

export default router;