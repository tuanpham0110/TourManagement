import { useState } from 'react';
import { apiFetch } from '../api';

export default function LoginPage({ onLogin }) {
    const [form, setForm] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify(form)
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setMessage('Đăng nhập thành công');
            onLogin(data.user);
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="card">
            <h2>Đăng nhập</h2>
            <form onSubmit={handleSubmit} className="form-grid">
                <input
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="submit">Đăng nhập</button>
            </form>
            {message && <p>{message}</p>}
            <p>Tài khoản test: customer1 / 123456</p>
        </div>
    );
}