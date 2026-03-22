import pool from '../config/db.js';

function applyVoucher(total, voucher) {
    if (!voucher) return total;

    if (voucher.discount_type === 'PERCENT') {
        return total - (total * Number(voucher.discount_value)) / 100;
    }

    return total - Number(voucher.discount_value);
}

export async function createBooking(req, res) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const { customerId, scheduleId, quantity, passengers = [], voucherCode = null, serviceItems = [] } = req.body;

        const [scheduleRows] = await conn.query(
            `SELECT ts.*, t.name AS tour_name
       FROM tour_schedules ts
       JOIN tours t ON t.id = ts.tour_id
       WHERE ts.id = ? FOR UPDATE`,
            [scheduleId]
        );

        if (!scheduleRows.length) {
            throw new Error('Lịch khởi hành không tồn tại');
        }

        const schedule = scheduleRows[0];

        if (schedule.available_slots < quantity) {
            throw new Error('Không đủ chỗ trống');
        }

        let total = Number(schedule.actual_price) * Number(quantity);
        let voucher = null;

        if (voucherCode) {
            const [voucherRows] = await conn.query(
                `SELECT * FROM vouchers WHERE code = ? AND expired_at >= NOW()`,
                [voucherCode]
            );
            if (voucherRows.length) voucher = voucherRows[0];
        }

        for (const item of serviceItems) {
            const [serviceRows] = await conn.query('SELECT * FROM services WHERE id = ?', [item.serviceId]);
            if (!serviceRows.length) throw new Error('Dịch vụ không tồn tại');
            total += Number(serviceRows[0].unit_price) * Number(item.quantity);
        }

        total = Math.max(0, applyVoucher(total, voucher));

        const [bookingResult] = await conn.query(
            `INSERT INTO bookings (customer_id, schedule_id, voucher_id, quantity, total_amount, status, booking_channel)
       VALUES (?, ?, ?, ?, ?, 'CONFIRMED', 'ONLINE')`,
            [customerId, scheduleId, voucher ? voucher.id : null, quantity, total]
        );

        const bookingId = bookingResult.insertId;

        for (const p of passengers) {
            await conn.query(
                `INSERT INTO passengers (booking_id, full_name, gender, date_of_birth, identity_number)
         VALUES (?, ?, ?, ?, ?)`,
                [bookingId, p.fullName, p.gender || 'OTHER', p.dateOfBirth || null, p.identityNumber || null]
            );
        }

        for (const item of serviceItems) {
            const [serviceRows] = await conn.query('SELECT * FROM services WHERE id = ?', [item.serviceId]);
            const service = serviceRows[0];
            const totalPrice = Number(service.unit_price) * Number(item.quantity);

            await conn.query(
                `INSERT INTO booking_services (booking_id, service_id, quantity, total_price)
         VALUES (?, ?, ?, ?)`,
                [bookingId, item.serviceId, item.quantity, totalPrice]
            );
        }

        await conn.query(
            `INSERT INTO invoices (booking_id, payment_method, amount, payment_status)
       VALUES (?, 'BANKING', ?, 'UNPAID')`,
            [bookingId, total]
        );

        await conn.query(
            `UPDATE tour_schedules
       SET available_slots = available_slots - ?,
           status = CASE WHEN available_slots - ? <= 0 THEN 'FULL' ELSE status END
       WHERE id = ?`,
            [quantity, quantity, scheduleId]
        );

        await conn.commit();

        return res.status(201).json({
            message: 'Đặt tour thành công',
            bookingId,
            totalAmount: total
        });
    } catch (error) {
        await conn.rollback();
        return res.status(400).json({ message: error.message || 'Tạo booking thất bại' });
    } finally {
        conn.release();
    }
}

export async function getBookingHistory(req, res) {
    try {
        const { customerId } = req.params;

        const [rows] = await pool.query(
            `SELECT b.id, b.booking_date, b.quantity, b.total_amount, b.status,
              t.name AS tour_name, ts.departure_date, ts.return_date,
              i.payment_status, i.payment_method
       FROM bookings b
       JOIN tour_schedules ts ON ts.id = b.schedule_id
       JOIN tours t ON t.id = ts.tour_id
       LEFT JOIN invoices i ON i.booking_id = b.id
       WHERE b.customer_id = ?
       ORDER BY b.id DESC`,
            [customerId]
        );

        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi lấy lịch sử booking', error: error.message });
    }
}

export async function payBooking(req, res) {
    try {
        const { bookingId } = req.params;
        const { paymentMethod = 'BANKING' } = req.body;

        await pool.query(
            `UPDATE invoices
       SET payment_method = ?, payment_status = 'PAID', payment_date = NOW()
       WHERE booking_id = ?`,
            [paymentMethod, bookingId]
        );

        return res.json({ message: 'Thanh toán thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi thanh toán', error: error.message });
    }
}