import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import tourRoutes from './routes/tour.routes.js';
import bookingRoutes from './routes/booking.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Tour Management API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);

export default app;