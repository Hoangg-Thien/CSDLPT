INSERT INTO users (full_name, phone, province, region) VALUES
('Nguyen Van A', '0901000001', 'hồ chí minh', 'SOUTH'),
('Tran Thi B',   '0901000002', 'bình dương',   'SOUTH'),
('Le Van C',     '0901000003', 'hà nội',       'NORTH'),
('Pham Thi D',   '0901000004', 'hải phòng',    'NORTH');

INSERT INTO drivers (full_name, phone, province, region) VALUES
('Driver HCM 1', '0911000001', 'hồ chí minh', 'SOUTH'),
('Driver HCM 2', '0911000002', 'bình dương',   'SOUTH'),
('Driver HN 1',  '0911000003', 'hà nội',       'NORTH'),
('Driver HN 2',  '0911000004', 'hải phòng',    'NORTH');

INSERT INTO rides (user_id, pickup, dropoff, status, region) VALUES
(1, 'Quận 1', 'Quận 7',    'COMPLETED', 'SOUTH'),
(1, 'Quận 3', 'Tân Bình',  'COMPLETED', 'SOUTH'),
(1, 'Quận 5', 'Bình Thạnh','COMPLETED', 'SOUTH'),
(2, 'Dĩ An',  'Thủ Dầu Một','COMPLETED','SOUTH'),
(3, 'Hoàn Kiếm','Cầu Giấy','COMPLETED', 'NORTH'),
(3, 'Đống Đa', 'Hai Bà Trưng','COMPLETED','NORTH'),
(4, 'Lê Chân', 'Ngô Quyền', 'COMPLETED', 'NORTH');
