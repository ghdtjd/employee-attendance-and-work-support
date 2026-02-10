# 백엔드 수정 가이드

## 문제 원인

500 에러가 발생하는 이유는 `findByUser(User user)` 메서드가 **세션에서 가져온 detached 상태의 User 객체**로는 제대로 동작하지 않기 때문입니다.

세션에 저장된 User 객체는 JPA 영속성 컨텍스트와 분리되어 있어서, Spring Data JPA가 해당 객체로 Employee를 조회할 때 문제가 발생합니다.

---

## 수정 방법

### 1. EmployeeRepository.java 수정

**파일 위치:** `workhub/src/main/java/com/teamproject/workhub/repository/EmployeeRepository/EmployeeRepository.java`

```java
package com.teamproject.workhub.repository.EmployeeRepository;

import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.Role;
import com.teamproject.workhub.entity.userEntity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUser(User user);

    Optional<Employee> findByEmployeeNo(String employeeNo);

    Optional<Employee> findByName(String name);

    // 추가: User ID로 Employee 조회 (detached User 객체 문제 해결)
    @Query("SELECT e FROM Employee e WHERE e.user.id = :userId")
    Optional<Employee> findByUserId(@Param("userId") Long userId);
}
```

---

### 2. AttendanceService.java 수정

**파일 위치:** `workhub/src/main/java/com/teamproject/workhub/service/attendanceService/AttendanceService.java`

**모든 `findByUser(loginUser)` 호출을 `findByUserId(loginUser.getId())`로 변경:**

```java
// 변경 전
Employee employee = employeeRepository.findByUser(loginUser)
        .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

// 변경 후
Employee employee = employeeRepository.findByUserId(loginUser.getId())
        .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));
```

**수정해야 할 메서드들:**
- `getMyAttendance()` (28~30번 줄)
- `getMyAttendanceByPeriod()` (42~44번 줄)
- `getMyAttendanceByMonth()` (56~58번 줄)
- `getMyAttendanceByStatus()` (76~78번 줄)
- `checkIn()` (90~92번 줄)
- `checkOut()` (121~123번 줄)
- `getTodayAttendance()` (150~152번 줄)

---

### 3. EmployeeService.java 수정

**파일 위치:** `workhub/src/main/java/com/teamproject/workhub/service/employeeService/EmployeeService.java`

```java
// 변경 전
Employee employee = employeeRepository.findByUser(loginUser)
        .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

// 변경 후
Employee employee = employeeRepository.findByUserId(loginUser.getId())
        .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));
```

---

### 4. EmployeeController.java 수정

**파일 위치:** `workhub/src/main/java/com/teamproject/workhub/controller/employeeController/EmployeeController.java`

**getMyInfo 메서드 수정 (37~38번 줄):**

```java
// 변경 전
Employee employee = employeeRepository.findByUser(loginUser)
        .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

// 변경 후
Employee employee = employeeRepository.findByUserId(loginUser.getId())
        .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));
```

---

### 5. UserController.java 수정

**파일 위치:** `workhub/src/main/java/com/teamproject/workhub/controller/userController/UserController.java`

**checkLogin 메서드 수정 (83~84번 줄):**

```java
// 변경 전
Employee employee = employeeRepository.findByUser(user)
        .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

// 변경 후
Employee employee = employeeRepository.findByUserId(user.getId())
        .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));
```

---

## 수정 순서 요약

1. **EmployeeRepository.java** - `findByUserId` 메서드 추가
2. **UserController.java** - `checkLogin` 메서드 수정
3. **EmployeeController.java** - `getMyInfo` 메서드 수정
4. **EmployeeService.java** - `updateMyInfo` 메서드 수정
5. **AttendanceService.java** - 모든 메서드 수정 (7개)

---

## 수정 후 확인

1. 백엔드 서버 재시작
2. 브라우저에서 로그인 후 테스트:
   - 내 정보 조회
   - 정보 수정
   - 비밀번호 변경
   - 출퇴근 버튼
   - 근태 기록 조회

---

## 참고

이 문제는 HTTP 세션에 저장된 Java 객체가 JPA 영속성 컨텍스트에서 분리(detached)되어 발생합니다. `findByUser(User user)`는 객체 참조로 비교하려 하지만, detached 객체는 영속성 컨텍스트와 연결되지 않아 실패합니다.

`findByUserId(Long userId)`는 단순히 ID 값(Long)으로 비교하므로 이 문제가 발생하지 않습니다.
