# EmployeeController 비밀번호 변경 엔드포인트 추가

## ❌ 문제 원인

**404 Not Found 에러**: `/api/userinfo/password` 엔드포인트가 존재하지 않음

EmployeeController에:
- ✅ import 완료 (PasswordChangeDto, UserService)
- ✅ 의존성 주입 완료 (UserService)
- ❌ **비밀번호 변경 메서드 없음** ← 이게 문제!

---

## ✅ 해결 방법

### EmployeeController.java
**파일 경로**: `/src/main/java/com/teamproject/workhub/controller/employeeController/EmployeeController.java`

#### 61번째 줄 (마지막 } 전)에 다음 메서드를 추가하세요:

```java
    // 비밀번호 변경
    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @RequestBody PasswordChangeDto passwordChangeDto,
            HttpServletRequest request) {

        // 세션에서 로그인한 사용자 정보 가져오기
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        try {
            // UserService에서 비밀번호 변경 처리
            userService.changePassword(
                    loginUser,
                    passwordChangeDto.getCurrentPassword(),
                    passwordChangeDto.getNewPassword()
            );
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
```

---

## 📝 전체 파일 (수정 후)

### EmployeeController.java (전체)
```java
package com.teamproject.workhub.controller.employeeController;

import com.teamproject.workhub.dto.employeeDto.EmployeeResponseDto;
import com.teamproject.workhub.dto.employeeDto.EmployeeUpdateDto;
import com.teamproject.workhub.dto.userDto.UserResponseDto;
import com.teamproject.workhub.entity.employeeEntity.Employee;
import com.teamproject.workhub.entity.userEntity.User;
import com.teamproject.workhub.repository.EmployeeRepository.EmployeeRepository;
import com.teamproject.workhub.service.employeeService.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.teamproject.workhub.dto.userDto.PasswordChangeDto;
import com.teamproject.workhub.service.userService.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/userinfo")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final UserService userService;

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        Employee employee = employeeRepository.findByUser(loginUser)
                .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

        EmployeeResponseDto userInfo = EmployeeResponseDto.from(loginUser, employee);
        return ResponseEntity.ok(userInfo);
    }

    // 내 정보 수정 (email, phone만 수정 가능)
    @PutMapping("/me")
    public ResponseEntity<String> updateMyInfo(
            @RequestBody EmployeeUpdateDto updateDto,
            HttpServletRequest request) {

        // 세션에서 로그인한 사용자 정보 가져오기
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        // 서비스 계층에서 업데이트 처리
        employeeService.updateMyInfo(loginUser, updateDto);

        return ResponseEntity.ok("내 정보가 수정되었습니다.");
    }

    // 비밀번호 변경
    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @RequestBody PasswordChangeDto passwordChangeDto,
            HttpServletRequest request) {

        // 세션에서 로그인한 사용자 정보 가져오기
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loginUser") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
        User loginUser = (User) session.getAttribute("loginUser");

        try {
            // UserService에서 비밀번호 변경 처리
            userService.changePassword(
                    loginUser,
                    passwordChangeDto.getCurrentPassword(),
                    passwordChangeDto.getNewPassword()
            );
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
```

---

## ✅ 수정 체크리스트

- [ ] EmployeeController.java 파일 열기
- [ ] 61번째 줄 (마지막 `}` 전)로 이동
- [ ] 비밀번호 변경 메서드 추가 (위의 코드 복사)
- [ ] 파일 저장
- [ ] 애플리케이션 재시작

---

## 🧪 테스트 방법

### 1. 로그인
```
POST http://localhost:8080/api/login
Content-Type: application/json

{
  "employeeNo": "EMP001",
  "password": "1111"
}
```

### 2. 비밀번호 변경
```
PUT http://localhost:8080/api/userinfo/password
Content-Type: application/json

{
  "currentPassword": "1111",
  "newPassword": "newpass123"
}
```

**예상 응답**:
```
200 OK
"비밀번호가 성공적으로 변경되었습니다."
```

### 3. 새 비밀번호로 로그인 확인
```
POST http://localhost:8080/api/login
Content-Type: application/json

{
  "employeeNo": "EMP001",
  "password": "newpass123"
}
```

---

## 📊 추가된 엔드포인트

```
PUT /api/userinfo/password
Content-Type: application/json

Request Body:
{
  "currentPassword": "현재 비밀번호",
  "newPassword": "새 비밀번호"
}

Responses:
- 200 OK: "비밀번호가 성공적으로 변경되었습니다."
- 400 Bad Request: "현재 비밀번호가 일치하지 않습니다."
- 400 Bad Request: "새 비밀번호는 현재 비밀번호와 달라야 합니다."
- 401 Unauthorized: "로그인이 필요합니다."
```

---

## 📌 최종 확인

수정 완료 후 다음을 확인하세요:

1. [ ] 컴파일 오류 없음
2. [ ] 애플리케이션 재시작 완료
3. [ ] PUT `/api/userinfo/password` 호출 시 404 에러 해결
4. [ ] 비밀번호 변경 성공 (200 OK)
5. [ ] 새 비밀번호로 로그인 성공

---

## 🎯 요약

**문제**: 비밀번호 변경 엔드포인트 메서드가 없음
**해결**: EmployeeController에 `@PutMapping("/password")` 메서드 추가
**위치**: 61번째 줄 (마지막 `}` 전)

---

**작성일**: 2026-01-30
**작성자**: Claude (Cowork AI Assistant)
**에러 타입**: 404 Not Found
**해결 방법**: changePassword() 메서드 추가
