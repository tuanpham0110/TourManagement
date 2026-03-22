import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function TourListPage({ user }) {
    const [keyword, setKeyword] = useState('');
    const [tours, setTours] = useState([]);
    const [selectedTour, setSelectedTour] = useState(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');

    async function loadTours() {
        const data = await apiFetch(`/tours?keyword=${encodeURIComponent(keyword)}`);
        setTours(data);
    }

    async function viewDetail(id) {
        const data = await apiFetch(`/tours/${id}`);
        setSelectedTour(data);
    }

    async function handleBooking() {
        try {
            if (!user || user.role !== 'CUSTOMER') {
                setMessage('Bạn cần đăng nhập bằng tài khoản khách hàng');
                return;
            }

            const bookingPayload = {
                customerId: 1,
                scheduleId: Number(selectedScheduleId),
                quantity: Number(quantity),
                passengers: Array.from({ length: Number(quantity) }).map((_, index) => ({
                    fullName: `Hành khách ${index + 1}`,
                    gender: 'OTHER'
                })),
                serviceItems: []
            };

            const data = await apiFetch('/bookings', {
                method: 'POST',
                body: JSON.stringify(bookingPayload)
            });

            setMessage(`Đặt tour thành công. Mã booking: ${data.bookingId}. Tổng tiền: ${data.totalAmount}`);
            await viewDetail(selectedTour.id);
        } catch (error) {
            setMessage(error.message);
        }
    }

    useEffect(() => {
        loadTours();
    }, [])
    return (
        <div classname="grid-2">
            <div className="card">
                <h2>Danh sách tour</h2>
                <div className="toolbar">
                    <input
                        placeholder="Tìm theo tên tour"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button onClick={loadTours}>Tìm kiếm</button>
                </div>

                <div className="list">
                    {tours.map((tour) => (
                        <div className="item" key={tour.id}>
                            <h3>{tour.name}</h3>
                            <p>Điểm đến: {tour.destination}</p>
                            <p>Giá cơ bản: {Number(tour.base_price).toLocaleString('vi-VN')} đ</p>
                            <button onClick={() => viewDetail(tour.id)}>Xem chi tiết</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <h2>Chi tiết tour</h2>
                {!selectedTour && <p>Chọn một tour để xem chi tiết.</p>}

                {selectedTour && (
                    <>
                        <h3>{selectedTour.name}</h3>
                        <p>{selectedTour.description}</p>
                        <p>Điểm đến: {selectedTour.destination}</p>
                        <p>Thời lượng: {selectedTour.duration_days} ngày</p>

                        <h4>Lịch khởi hành</h4>
                        {selectedTour.schedules.map((s) => (
                            <label key={s.id} className="radio-row">
                                <input
                                    type="radio"
                                    name="schedule"
                                    value={s.id}
                                    onChange={(e) => setSelectedScheduleId(e.target.value)}
                                />
                                <span>
                                    {s.departure_date} - {s.return_date} | còn {s.available_slots} chỗ | giá {Number(s.actual_price).toLocaleString('vi-VN')} đ
                                </span>
                            </label>
                        ))}

                        <div className="toolbar">
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                            <button onClick={handleBooking}>Đặt tour</button>
                        </div>
                    </>
                )}

                {message && <p>{message}</p>}
            </div>
        </div >
    );
}