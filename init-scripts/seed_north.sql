INSERT INTO users (full_name, phone, province, region) VALUES
('North User 01', '0903000001', 'ha noi', 'NORTH'),
('North User 02', '0903000002', 'ha noi', 'NORTH'),
('North User 03', '0903000003', 'hai phong', 'NORTH'),
('North User 04', '0903000004', 'bac ninh', 'NORTH');

INSERT INTO drivers (full_name, phone, province, region) VALUES
('North Driver 01', '0913000001', 'ha noi', 'NORTH'),
('North Driver 02', '0913000002', 'ha noi', 'NORTH'),
('North Driver 03', '0913000003', 'hai phong', 'NORTH'),
('North Driver 04', '0913000004', 'bac ninh', 'NORTH');

INSERT INTO rides (user_id, driver_id, pickup, dropoff, status, region) VALUES
(1, 1, 'Hoan Kiem', 'Cau Giay', 'COMPLETED', 'NORTH'),
(1, 2, 'Dong Da', 'Hai Ba Trung', 'COMPLETED', 'NORTH'),
(2, 1, 'Tay Ho', 'Nam Tu Liem', 'COMPLETED', 'NORTH'),
(2, 3, 'Long Bien', 'Gia Lam', 'COMPLETED', 'NORTH'),
(3, 4, 'Ngo Quyen', 'Le Chan', 'COMPLETED', 'NORTH'),
(3, 2, 'Kien An', 'Do Son', 'COMPLETED', 'NORTH'),
(4, 1, 'Bac Ninh City', 'Tu Son', 'COMPLETED', 'NORTH'),
(4, 3, 'Yen Phong', 'Que Vo', 'COMPLETED', 'NORTH'),
(1, 4, 'Thanh Xuan', 'Ha Dong', 'COMPLETED', 'NORTH'),
(2, 2, 'Ba Dinh', 'Hoang Mai', 'COMPLETED', 'NORTH'),
(3, 1, 'Hai An', 'Hong Bang', 'COMPLETED', 'NORTH'),
(4, 2, 'Tien Du', 'Thuan Thanh', 'COMPLETED', 'NORTH');
