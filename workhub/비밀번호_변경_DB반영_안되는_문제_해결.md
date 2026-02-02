# 비밀번호 변경이 DB에 반영되지 않는 문제 해결 가이드

## ❌ 문제 상황

1. PUT `/api/userinfo/password` 호출 → "비밀번호가 성공적으로 변경되었습니다." 응답
2. 하지만 실제로는 DB에 반영되지 않음
3. 새 비밀번호로 로그인 시도 → 로그인 실패

---

## 🔍 원인 분석

### 문제의 근본 원인: **Detached 엔티티**

```java
// EmployeeController에서
User loginUser = (User) session.getAttribute("loginUser");

// UserService로 전달
userService.changePassword(loginUser, currentPassword, newPassword);

// UserService에서
loginUser.changePassword(encodedNewPassword);  // ❌ DB에 반영 안 됨!
```

**왜 안 될까?**
- 세션에서 가져온 `loginUser`는 **Detached 상태**입니다
- Detached 상태의 엔티티는 JPA의 영속성 컨텍스트에서 관리되지 않음
- 따라서 엔티티를 변경해도 Dirty Checking이 작동하지 않음
- `@Transactional`이 있어도 DB에 반영되지 않음!

### 올바른 방법: **DB에서 다시 조회**
```java
// UserRepository로 다시 조회하면 Managed 상태가 됨
User user = userRepository.findById(loginUser.getId())
    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

user.changePassword(encodedNewPassword);  // ✅ DB에 반영됨!
```

---

## ✅ 해결 방법

### UserService.java 수정
**파일 경로**: `/src/main/java/com/teamproject/workhub/service/userService/UserService.java`

#### 현재 코드 (107-123번째 줄):
```java
    //비밀번호 변경 (본인만 가능)
    @jakarta.transaction.Transactional
    public void changePassword(User loginUser, String currentPassword, String newPassword) {

        if (!passwordEncoder.matches(currentPassword, loginUser.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (passwordEncoder.matches(newPassword, loginUser.getPassword())) {
            throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        String encodedNewPassword = passwordEncoder.encode(newPassword);
        loginUser.changePassword(encodedNewPassword);

        loginUser.setMustChangePassword(false);
    }
```

#### ✅ 수정 후 코드:
```java
    //비밀번호 변경 (본인만 가능)
    @jakarta.transaction.Transactional
    public void changePassword(User loginUser, String currentPassword, String newPassword) {
        // 1. DB에서 User를 다시 조회 (Managed 상태로 만듦)
        User user = userRepository.findById(loginUser.getId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. 현재 비밀번호 검증
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 3. 새 비밀번호 중복 확인
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        // 4. 비밀번호 변경
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        user.changePassword(encodedNewPassword);

        // 5. mustChangePassword 플래그 변경
        user.setMustChangePassword(false);

        // @Transactional 덕분에 자동으로 DB에 반영됨 (Dirty Checking)
    }
```

---

## 🔍 변경 사항 상세

### 핵심 변경: DB에서 User 다시 조회
```java
// ❌ 기존: 세션의 User를 직접 사용 (Detached)
loginUser.changePassword(encodedNewPassword);

// ✅ 수정: DB에서 다시 조회 (Managed)
User user = userRepository.findById(loginUser.getId())
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
user.changePassword(encodedNewPassword);
```

### 모든 loginUser → user로 변경
```java
// 변경 전
loginUser.getPassword()
loginUser.changePassword()
loginUser.setMustChangePassword()

// 변경 후
user.getPassword()
user.changePassword()
user.setMustChangePassword()
```

---

## ✅ 수정 체크리스트

### UserService.java 수정
- [ ] 107-123번째 줄의 `changePassword()` 메서드 찾기
- [ ] 첫 줄에 `User user = userRepository.findById(loginUser.getId())...` 추가
- [ ] 모든 `loginUser` → `user`로 변경 (총 5군데)
- [ ] 마지막에 주석 추가: `// @Transactional 덕분에 자동으로 DB에 반영됨 (Dirty Checking)`
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

### 3. 로그아웃
```
POST http://localhost:8080/api/logout
```

### 4. 기존 비밀번호로 로그인 시도 (실패해야 정상)
```
POST http://localhost:8080/api/login
Content-Type: application/json

{
  "employeeNo": "EMP001",
  "password": "1111"
}
```

**예상 응답**:
```
401 Unauthorized
"로그인 실패(정보 확인 필요"
```

### 5. 새 비밀번호로 로그인 (성공해야 정상)
```
POST http://localhost:8080/api/login
Content-Type: application/json

{
  "employeeNo": "EMP001",
  "password": "newpass123"
}
```

**예상 응답**:
```
200 OK
"로그인 성공!!"
```

---

## 📊 JPA 영속성 상태 설명

### Detached vs Managed

#### Detached 상태 (문제 상황)
```java
// 세션에서 가져온 엔티티
User loginUser = (User) session.getAttribute("loginUser");

loginUser.changePassword("new");  // ❌ DB에 반영 안 됨
```
- 영속성 컨텍스트에서 관리되지 않음
- 변경해도 Dirty Checking 작동 안 함
- `@Transactional` 있어도 소용없음

#### Managed 상태 (해결 방법)
```java
// Repository로 조회한 엔티티
User user = userRepository.findById(id).orElseThrow();

user.changePassword("new");  // ✅ DB에 반영됨
// @Transactional이 끝날 때 자동으로 UPDATE 쿼리 실행
```
- 영속성 컨텍스트에서 관리됨
- 변경 시 Dirty Checking 작동
- `@Transactional` 종료 시 자동으로 DB에 반영

---

## 🎯 왜 이렇게 수정해야 하나?

### 1. 세션의 User는 Detached
```java
// 로그인 시
HttpSession session = request.getSession();
session.setAttribute("loginUser", user);  // User 객체가 세션에 저장됨

// 나중에
User loginUser = (User) session.getAttribute("loginUser");  // Detached 상태!
```

### 2. Repository 조회로 Managed 상태로 만들기
```java
User user = userRepository.findById(loginUser.getId()).orElseThrow();
// 이제 'user'는 Managed 상태
// 변경하면 자동으로 DB에 반영됨
```

### 3. Dirty Checking 작동
```java
@Transactional
public void changePassword(...) {
    User user = userRepository.findById(...).orElseThrow();  // Managed
    user.changePassword(newPassword);  // 변경 감지
    // 메서드 종료 시 자동으로 UPDATE 쿼리 실행
}
```

---

## 💡 추가 정보

### 이 패턴은 다른 곳에도 적용 가능

#### EmployeeService.updateMyInfo()도 확인 필요
만약 Employee 정보 수정도 안 된다면 같은 방법으로 수정:

```java
@Transactional
public void updateMyInfo(User loginUser, EmployeeUpdateDto updateDto) {
    // DB에서 다시 조회
    Employee employee = employeeRepository.findByUser(loginUser)
            .orElseThrow(() -> new RuntimeException("사원 정보를 찾을 수 없습니다."));

    // 수정
    employee.updateMyInfo(updateDto.getEmail(), updateDto.getPhone());

    // @Transactional 덕분에 자동으로 DB에 반영됨
}
```

### 대안: merge() 사용 (비추천)
```java
// 이 방법도 가능하지만 복잡함
User managedUser = entityManager.merge(loginUser);
managedUser.changePassword(newPassword);
```

### 대안: save() 직접 호출 (비추천)
```java
// 이 방법도 가능하지만 불필요한 쿼리 발생
loginUser.changePassword(newPassword);
userRepository.save(loginUser);  // merge 후 SELECT + UPDATE 쿼리
```

**권장 방법**: Repository로 조회 + @Transactional + Dirty Checking ✅

---

## ⚠️ 주의사항

### 1. getId() 메서드 확인
User 엔티티에 `getId()` 메서드가 있어야 합니다:
```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {  // Getter 필요
        return id;
    }
}
```

### 2. @Transactional 필수
```java
@jakarta.transaction.Transactional  // 또는 @org.springframework.transaction.annotation.Transactional
public void changePassword(...) {
    // ...
}
```
- 없으면 Dirty Checking 작동 안 함
- 변경사항이 DB에 반영되지 않음

### 3. 세션 User 객체는 업데이트 안 됨
```java
// 비밀번호 변경 후에도 세션의 User는 그대로
User sessionUser = (User) session.getAttribute("loginUser");
// sessionUser.getPassword()는 여전히 이전 비밀번호 (암호화된 값)
```
- 하지만 문제없음: 다음 로그인 시 새로 세션에 저장됨
- 필요하다면 세션 갱신 가능:
  ```java
  // 변경 후 세션 갱신
  User updatedUser = userRepository.findById(loginUser.getId()).orElseThrow();
  session.setAttribute("loginUser", updatedUser);
  ```

---

## 📌 최종 확인

수정 완료 후 다음을 확인하세요:

1. [ ] UserService.changePassword()에 `userRepository.findById()` 추가됨
2. [ ] 모든 `loginUser` → `user`로 변경됨
3. [ ] 컴파일 오류 없음
4. [ ] 애플리케이션 재시작 완료
5. [ ] 비밀번호 변경 API 호출 (200 OK)
6. [ ] 기존 비밀번호로 로그인 시도 (401 실패)
7. [ ] 새 비밀번호로 로그인 시도 (200 성공) ✅
8. [ ] DB에서 직접 확인:
   ```sql
   SELECT password FROM users WHERE employee_no = 'EMP001';
   -- 비밀번호 해시 값이 변경되었는지 확인
   ```

---

## 🎉 정리

**문제**: 세션의 User는 Detached 상태 → 변경해도 DB 반영 안 됨
**해결**: UserRepository로 다시 조회 → Managed 상태 → Dirty Checking 작동 → DB 반영 ✅

**핵심 한 줄**:
```java
User user = userRepository.findById(loginUser.getId()).orElseThrow();
```

---

**작성일**: 2026-02-02
**작성자**: Claude (Cowork AI Assistant)
**문제**: Detached 엔티티 변경 시 DB 미반영
**해결**: Repository로 재조회하여 Managed 상태로 변경
