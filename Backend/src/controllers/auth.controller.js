import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export async function login(req, res) {
    try {
        const { username, password } = req.body;

        const [rows] = await pool.query(
            'SELECT id, username, password_hash, role, status FROM accounts WHERE username = ?',
            [username]
        );

        if (!rows.length) {
            return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
        }

        const account = rows[0];

        if (account.status !== 'ACTIVE') {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }

        const ok = await bcrypt.compare(password, account.password_hash);
        if (!ok) {
            return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
        }

        const token = jwt.sign(
            { accountId: account.id, username: account.username, role: account.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: account.id,
                username: account.username,
                role: account.role
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
}