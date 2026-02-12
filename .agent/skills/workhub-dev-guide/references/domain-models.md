# WorkHub 도메인 모델 상세 레퍼런스

이 문서는 WorkHub 프로젝트의 기존 도메인 모델을 상세히 기술합니다. 새로운 기능을 구현할 때 기존 패턴을 참조하세요.

---

## 목차

1. [User 도메인](#1-user-도메인)
2. [Employee 도메인](#2-employee-도메인)
3. [Department 도메인](#3-department-도메인)
4. [Attendance 도메인](#4-attendance-도메인)
5. [Board 도메인](#5-board-도메인)
6. [Task 도메인](#6-task-도메인)
7. [DB 테이블 관계도](#7-db-테이블-관계도)

---

## 1. User 도메인

### Entity: User
```java
@Table(name = "users")
// 필드: id, employeeNo(unique), password(BCrypt), role(ADMIN/USER),
//       isActive, mustChangePassword(default true), lastLogin, createdAt, updatedAt
// 비즈니스 메서드: updateLastLogin(), changePassword(String)
```

### Enum: Role
```java
ADMIN, USER
```

### 관련 DTO
- `RegisterRequest`: employeeNo, name, email, phone, position, joinDate, departNo
- `LoginRequest`: employeeNo, password
- `UserResponseDto`: id, employeeNo, role, isActive
- `PasswordRequest`: id (비밀번호 초기화 대상)
- `PasswordChangeDto`: currentPassword, newPassword

### API 엔드포인트
```
POST /api/admin/register     관리자 사원 등록 (비번 기본 1111)
POST /api/login              로그인 → 세션 생성
POST /api/logout             로그아웃 → 세션 무효화
GET  /api/check-login        세션 확인 (User + Employee 정보 반환)
GET  /api/admin/employees    전체 사원 목록
```

### Service 특이사항
- 등록 시 비밀번호 기본값: "1111" (BCrypt 인코딩)
- 로그인 실패 시 null 반환 (예외 아님)
- 비밀번호 초기화: "0000"으로 리셋

---

## 2. Employee 도메인

### Entity: Employee
```java
@Table(name = "employees")
// 필드: id, user(@ManyToOne User), employeeNo, name, department(@ManyToOne),
//       email, phone, position, joinDate
```

### 관련 DTO
- `EmployeeRequest`: email, phone (수정용)
- `EmployeeResponseDto`: id, employeeNo, name, departName, email, phone, position, joinDate
- `EmployeeUpdateDto`: email, phone

### Repository 쿼리
```java
Optional<Employee> findByUser(User user);
Optional<Employee> findByEmployeeNo(String employeeNo);
Optional<Employee> findByName(String name);
@Query("SELECT e FROM Employee e WHERE e.user.id = :userId")
Optional<Employee> findByUserId(@Param("userId") Long userId);
```

---

## 3. Department 도메인

### Entity: Department
```java
@Table(name = "departments")
// 필드: id, departName, phone, email, location, manager
```

---

## 4. Attendance 도메인

### Entity: Attendance
```java
@Table(name = "attendance")
// 필드: id, employee(@ManyToOne LAZY), workDate(LocalDate),
//       checkInTime(LocalTime), checkOutTime(LocalTime),
//       status(AttendanceStatus), notes, createdAt, updatedAt
// 비즈니스 메서드: checkIn(), checkOut()(상태 자동 계산), getWorkHours()
// 상태 자동 계산: 09:00 이후 출근=LATE, 18:00 이전 퇴근=EARLY_LEAVE
```

### Enum: AttendanceStatus
```java
NORMAL, LATE, EARLY_LEAVE, ABSENT, VACATION, SICK_LEAVE, BUSINESS_TRIP
```

### Repository 쿼리 (참고 패턴)
```java
findByEmployeeOrderByWorkDateDesc(Employee)
findByEmployeeAndWorkDateBetweenOrderByWorkDateDesc(Employee, LocalDate, LocalDate)
findByEmployeeAndStatusOrderByWorkDateDesc(Employee, AttendanceStatus)
findByEmployeeAndWorkDate(Employee, LocalDate)
```

### Service 특이사항
- 클래스 레벨 `@Transactional(readOnly = true)` + 쓰기 메서드에만 `@Transactional`
- Employee 조회: `findByUserId(loginUser.getId())` (detached 문제 방지)
- 출근 중복 체크: 오늘 날짜 기록 있으면 예외
- 퇴근: checkOutTime 이미 있으면 예외

### API 엔드포인트
```
GET  /api/attendance/me                    내 전체 근태
GET  /api/attendance/me/period?start&end   기간별 조회
GET  /api/attendance/me/month?year&month   월별 조회
GET  /api/attendance/me/status/{status}    상태별 조회
POST /api/attendance/check-in              출근 (body: notes)
POST /api/attendance/check-out             퇴근
GET  /api/attendance/today                 오늘 근태
GET  /api/admin/attendance/all             관리자: 전체 조회
```

---

## 5. Board 도메인

### Entity: Board
```java
@Table(name = "boards")
// 필드: id, employee(@ManyToOne LAZY), title, content,
//       importance(HIGH/NORMAL/LOW), createdAt
```

### Enum: Importance
```java
HIGH, NORMAL, LOW
```

### API 엔드포인트
```
POST /api/board          공지 등록 (ADMIN만)
GET  /api/board          전체 공지 목록
GET  /api/board/{id}     공지 상세
```

---

## 6. Task 도메인

### Entity: Task
```java
@Table(name = "tasks")
// 필드: id, employeeId(Long), userId(Long), departNo(Long),
//       dueDate(LocalDate), title, description,
//       status(TODO/IN_PROGRESS/DONE), priority(Integer), createdAt
// @PrePersist: createdAt 설정, status 기본값 TODO
// 참고: 관계 매핑(@ManyToOne) 대신 ID값(Long)을 직접 저장하는 패턴
```

### Enum: TaskStatus
```java
TODO("未着手"),
IN_PROGRESS("進行中"),
DONE("完了")
```

### API 엔드포인트
```
GET    /api/task              전체 목록
GET    /api/task/{id}         상세 조회
POST   /api/task              생성 (세션 인증 + 권한 체크)
PUT    /api/task/{id}         수정
DELETE /api/task/{id}         삭제
PATCH  /api/task/{id}/status  상태 변경
PUT    /api/task/{id}/assignee 담당자 변경
GET    /api/task/test         연결 테스트
```

### Controller 특이사항
- 생성 시 권한 체크: ADMIN은 모든 사원에게 할당 가능, USER는 본인만
- EmployeeRepository를 Controller에서 직접 사용 (Service 위임이 아님)

---

## 7. DB 테이블 관계도

```
users (1) ──── (1) employees
                    │
                    ├── (N) attendance
                    ├── (N) boards
                    └── (N) tasks (employeeId로 참조)

departments (1) ──── (N) employees
```

핵심 관계:
- User ↔ Employee: 1:1 (Employee가 User를 @ManyToOne으로 참조)
- Employee ↔ Attendance: 1:N
- Employee ↔ Board: 1:N
- Department ↔ Employee: 1:N
- Task: employeeId, userId를 Long으로 직접 저장 (JPA 관계 매핑 없음)
