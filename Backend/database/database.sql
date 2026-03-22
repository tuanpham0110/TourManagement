CREATE DATABASE IF NOT EXISTS tour_management;

USE tour_management;

CREATE TABLE accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM(
        'ADMIN',
        'MANAGER',
        'SELLER',
        'RECEPTIONIST',
        'TOUR_GUIDE',
        'CUSTOMER'
    ) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE,
    address VARCHAR(255),
    customer_type ENUM('NORMAL', 'VIP') DEFAULT 'NORMAL',
    reward_points INT DEFAULT 0,
    customer_rank VARCHAR(50) DEFAULT 'Member',
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    position_name VARCHAR(100),
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE tours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    tour_type VARCHAR(50),
    duration_days INT NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tour_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tour_id INT NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    max_capacity INT NOT NULL,
    available_slots INT NOT NULL,
    actual_price DECIMAL(12, 2) NOT NULL,
    status ENUM('OPEN', 'FULL', 'CLOSED') DEFAULT 'OPEN',
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

CREATE TABLE itineraries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tour_id INT NOT NULL,
    day_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
);

CREATE TABLE vouchers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('PERCENT', 'FIXED') NOT NULL,
    discount_value DECIMAL(12, 2) NOT NULL,
    expired_at DATETIME NOT NULL,
    usage_condition TEXT
);

CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    employee_id INT NULL,
    schedule_id INT NOT NULL,
    voucher_id INT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    quantity INT NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    booking_channel ENUM('ONLINE', 'PHONE', 'ON_SITE') DEFAULT 'ONLINE',
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id),
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
);

CREATE TABLE passengers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') DEFAULT 'OTHER',
    date_of_birth DATE,
    identity_number VARCHAR(30),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE booking_services (
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (booking_id, service_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL UNIQUE,
    employee_id INT NULL,
    payment_method ENUM('CASH', 'BANKING', 'MOMO', 'VNPAY') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('UNPAID', 'PAID', 'REFUNDED') DEFAULT 'UNPAID',
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL UNIQUE,
    rating INT NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);