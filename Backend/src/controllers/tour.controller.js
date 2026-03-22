import pool from '../config/db.js';

export async function getTours(req, res) {
    try {
        const { keyword = '', destination = '' } = req.query;

        const [rows] = await pool.query(
            `SELECT t.id, t.name, t.destination, t.tour_type, t.duration_days, t.base_price, t.description, t.status
       FROM tours t
       WHERE t.status = 'ACTIVE'
         AND t.name LIKE ?
         AND t.destination LIKE ?
       ORDER BY t.id DESC`,
            [`%${keyword}%`, `%${destination}%`]
        );

        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi lấy danh sách tour', error: error.message });
    }
}

export async function getTourDetail(req, res) {
    try {
        const { id } = req.params;

        const [tourRows] = await pool.query('SELECT * FROM tours WHERE id = ?', [id]);
        if (!tourRows.length) {
            return res.status(404).json({ message: 'Không tìm thấy tour' });
        }

        const [scheduleRows] = await pool.query(
            'SELECT * FROM tour_schedules WHERE tour_id = ? ORDER BY departure_date ASC',
            [id]
        );

        const [itineraryRows] = await pool.query(
            'SELECT * FROM itineraries WHERE tour_id = ? ORDER BY day_number ASC',
            [id]
        );

        return res.json({
            ...tourRows[0],
            schedules: scheduleRows,
            itineraries: itineraryRows
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi lấy chi tiết tour', error: error.message });
    }
}

export async function createTour(req, res) {
    try {
        const { name, destination, tour_type, duration_days, base_price, description } = req.body;

        const [result] = await pool.query(
            `INSERT INTO tours (name, destination, tour_type, duration_days, base_price, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [name, destination, tour_type, duration_days, base_price, description]
        );

        return res.status(201).json({ id: result.insertId, message: 'Tạo tour thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi tạo tour', error: error.message });
    }
}

export async function updateTour(req, res) {
    try {
        const { id } = req.params;
        const { name, destination, tour_type, duration_days, base_price, description, status } = req.body;

        await pool.query(
            `UPDATE tours
       SET name = ?, destination = ?, tour_type = ?, duration_days = ?, base_price = ?, description = ?, status = ?
       WHERE id = ?`,
            [name, destination, tour_type, duration_days, base_price, description, status, id]
        );

        return res.json({ message: 'Cập nhật tour thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi cập nhật tour', error: error.message });
    }
}

export async function deleteTour(req, res) {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tours WHERE id = ?', [id]);
        return res.json({ message: 'Xóa tour thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi xóa tour', error: error.message });
    }
}