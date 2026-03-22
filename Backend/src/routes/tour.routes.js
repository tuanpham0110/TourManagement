import express from 'express';
import {
    getTours,
    getTourDetail,
    createTour,
    updateTour,
    deleteTour
} from '../controllers/tour.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

router.get('/', getTours);
router.get('/:id', getTourDetail);
router.post('/', authMiddleware, requireRole('MANAGER', 'ADMIN'), createTour);
router.put('/:id', authMiddleware, requireRole('MANAGER', 'ADMIN'), updateTour);
router.delete('/:id', authMiddleware, requireRole('MANAGER', 'ADMIN'), deleteTour);

export default router;