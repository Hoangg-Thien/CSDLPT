INSERT INTO users (full_name, phone, province, region) VALUES
('South User 01', '0902000001', 'ho chi minh', 'SOUTH'),
('South User 02', '0902000002', 'ho chi minh', 'SOUTH'),
('South User 03', '0902000003', 'binh duong', 'SOUTH'),
('South User 04', '0902000004', 'dong nai', 'SOUTH');

INSERT INTO drivers (full_name, phone, province, region) VALUES
('South Driver 01', '0912000001', 'ho chi minh', 'SOUTH'),
('South Driver 02', '0912000002', 'ho chi minh', 'SOUTH'),
('South Driver 03', '0912000003', 'binh duong', 'SOUTH'),
('South Driver 04', '0912000004', 'dong nai', 'SOUTH');

INSERT INTO rides (user_id, driver_id, pickup, dropoff, status, region) VALUES
(1, 1, 'District 1', 'District 7', 'COMPLETED', 'SOUTH'),
(1, 2, 'District 3', 'Tan Binh', 'COMPLETED', 'SOUTH'),
(2, 1, 'Thu Duc', 'District 5', 'COMPLETED', 'SOUTH'),
(2, 3, 'Di An', 'Thu Dau Mot', 'COMPLETED', 'SOUTH'),
(3, 4, 'Bien Hoa', 'Long Thanh', 'COMPLETED', 'SOUTH'),
(3, 2, 'Go Vap', 'Phu Nhuan', 'COMPLETED', 'SOUTH'),
(4, 1, 'District 10', 'District 4', 'COMPLETED', 'SOUTH'),
(4, 3, 'Binh Thanh', 'District 2', 'COMPLETED', 'SOUTH'),
(1, 4, 'District 6', 'Binh Tan', 'COMPLETED', 'SOUTH'),
(2, 2, 'District 11', 'District 8', 'COMPLETED', 'SOUTH'),
(3, 1, 'Tan Phu', 'District 12', 'COMPLETED', 'SOUTH'),
(4, 2, 'Hoc Mon', 'Cu Chi', 'COMPLETED', 'SOUTH');
