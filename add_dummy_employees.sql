USE attendance;

-- User 6 (EMP006)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP006', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP006', '', '강민수', 1, NULL, '사원', CURDATE(), NOW(), 'minsoo.kang@workhub.com', '010-1234-5678');

-- User 7 (EMP007)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP007', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP007', '', '박지은', 2, NULL, '사원', CURDATE(), NOW(), 'jieun.park@workhub.com', '010-2345-6789');

-- User 8 (EMP008)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP008', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP008', '', '이준호', 3, NULL, '사원', CURDATE(), NOW(), 'junho.lee@workhub.com', '010-3456-7890');

-- User 9 (EMP009)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP009', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP009', '', '최서연', 4, NULL, '사원', CURDATE(), NOW(), 'seoyeon.choi@workhub.com', '010-4567-8901');

-- User 10 (EMP010)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP010', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP010', '', '정우성', 1, NULL, '사원', CURDATE(), NOW(), 'woosung.jung@workhub.com', '010-5678-9012');

-- User 11 (EMP011)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP011', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP011', '', '김하늘', 2, NULL, '사원', CURDATE(), NOW(), 'haneul.kim@workhub.com', '010-6789-0123');

-- User 12 (EMP012)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP012', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP012', '', '윤현민', 3, NULL, '사원', CURDATE(), NOW(), 'hyunmin.yoon@workhub.com', '010-7890-1234');

-- User 13 (EMP013)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP013', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP013', '', '장미란', 4, NULL, '사원', CURDATE(), NOW(), 'miran.jang@workhub.com', '010-8901-2345');

-- User 14 (EMP014)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP014', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP014', '', '오지호', 1, NULL, '사원', CURDATE(), NOW(), 'jiho.oh@workhub.com', '010-9012-3456');

-- User 15 (EMP015)
INSERT INTO users (employee_no, employeeNo, password, role, is_active, must_change_password, created_at, updated_at)
VALUES ('EMP015', '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', 1, 1, NOW(), NOW());
SET @last_id = LAST_INSERT_ID();
INSERT INTO employee (id, employeeNo, employee_no, name, departNo, depart_no, position, join_date, created_at, email, phone)
VALUES (@last_id, 'EMP015', '', '신동엽', 2, NULL, '사원', CURDATE(), NOW(), 'dongyeop.shin@workhub.com', '010-0123-4567');
