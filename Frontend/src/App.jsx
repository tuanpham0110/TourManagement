import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import TourListPage from './pages/TourListPage';
import BookingHistoryPage from './pages/BookingHistoryPage';

export default function App() {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    });

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }

    return (
        <div className="container">
            <header className="header">
                <div>
                    <h1>Tour Management System</h1>
                    <p>MVP đặt tour du lịch</p>
                </div>
                <div>
                    {user ? (
                        <>
                            <span>{user.username} - {user.role}</span>
                            <button onClick={logout}>Đăng xuất</button>
                        </>
                    ) : (
                        <span>Chưa đăng nhập</span>
                    )}
                </div>
            </header>

            {!user && <LoginPage onLogin={setUser} />}

            <TourListPage user={user} />

            {user && user.role === 'CUSTOMER' && <BookingHistoryPage />}
        </div>
    );
}