import { useState } from 'react';
import { apiFetch } from '../api';

export default function BookingHistoryPage() {
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState('');

    async function loadHistory() {
        try {
            const data = await apiFetch('/bookings/history/1');
            setBookings(data);
        } catch (error) {
            setMessage(error.message);
        }
    }

    async function pay(bookingId) {
        try {
            await apiFetch(`/bookings/${bookingId}/pay`, {
                method: 'PATCH',
                body: JSON.stringify({ paymentMethod: 'BANKING' })
            });
            await loadHistory();
        } catch (error) {
            setMessage(error.message);
        }
    }

    return (
        <div className="card">
            <h2>Lịch sử booking</h2>
            <button onClick={loadHistory}>Tải lịch sử</button>
            {message && <p>{message}</p>}

            <div className="list">
                {bookings.map((item) => (
                    <div key={item.id} className="item">
                        <h3>{item.tour_name}</h3>
                        <p>Ngày đi: {item.departure_date}</p>
                        <p>Số lượng: {item.quantity}</p>
                        <p>Tổng tiền: {Number(item.total_amount).toLocaleString('vi-VN')} đ</p>
                        <p>Trạng thái booking: {item.status}</p>
                        <p>Trạng thái thanh toán: {item.payment_status}</p>
                        {item.payment_status !== 'PAID' && (
                            <button onClick={() => pay(item.id)}>Thanh toán</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}