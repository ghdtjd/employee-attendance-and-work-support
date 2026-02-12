---
name: workhub-dev-guide
description: WorkHub 프로젝트(사원 근태관리 및 업무지원 시스템) 개발 가이드 스킬. Spring Boot 4 + Next.js 풀스택 프로젝트의 일관된 개발을 위한 아키텍처, 코딩 컨벤션, 패턴을 제공합니다. 사용 시점 - WorkHub 관련 기능 추가, API 개발, Entity/DTO/Controller/Service 생성, 프론트엔드 페이지 추가, 버그 수정, 코드 리뷰 등 WorkHub 프로젝트 개발 작업 시 항상 사용하세요. 'workhub', '근태', '출퇴근', '사원관리', '업무관리', 'attendance', 'employee' 키워드가 등장하면 이 스킬을 참고하세요.
---

# WorkHub 개발 가이드

WorkHub는 **사원 근태관리 및 업무지원 시스템**으로, Spring Boot 4 백엔드와 Next.js 프론트엔드로 구성된 풀스택 프로젝트입니다. 이 가이드는 프로젝트의 기존 패턴과 컨벤션을 분석하여, 누가 개발하든 일관된 코드를 작성할 수 있도록 돕습니다.

---

## 1. 프로젝트 구조 개요

```
employee-attendance-and-work-support/
├── workhub/                          # Spring Boot 백엔드
│   ├── pom.xml                       # Maven (Spring Boot 4.0.2, Java 17)
│   └── src/main/java/com/teamproject/workhub/
│       ├── config/                   # SecurityConfig, WebConfig
│       ├── entity/                   # JPA 엔티티 (도메인별 하위 패키지)
│       ├── dto/                      # 데이터 전송 객체 (도메인별 하위 패키지)
│       ├── repository/               # JPA Repository 인터페이스
│       ├── service/                  # 비즈니스 로직 계층
│       └── controller/               # REST API 컨트롤러
├── frontend/employee-attendance-and-work-support/  # Next.js 프론트엔드
│   ├── app/                          # App Router 페이지
│   ├── components/                   # 재사용 컴포넌트
│   ├── context/                      # React Context (인증 등)
│   ├── lib/                          # API 호출 유틸리티
│   └── next.config.mjs              # API 프록시 설정
└── docs/                             # 문서
```

---

## 2. 기술 스택

| 구분 | 기술 | 버전/비고 |
|------|------|-----------|
| Backend Framework | Spring Boot | 4.0.2 |
| Java | OpenJDK | 17 |
| ORM | Hibernate (Spring Data JPA) | - |
| Database | MySQL | attendance 스키마 |
| 빌드 도구 | Maven | - |
| 비밀번호 암호화 | BCrypt | - |
| 인증 방식 | HTTP Session (세션 기반) | 60분 타임아웃 |
| Frontend Framework | Next.js (App Router) | - |
| UI 스타일링 | Tailwind CSS | 다크 테마 지원 |
| 상태관리 | React Context | auth-context |
| API 통신 | fetch (credentials: 'include') | - |
| 패키지 매니저 | pnpm | - |

---

## 3. 백엔드 개발 컨벤션

### 3.1 패키지 네이밍 규칙

도메인별로 하위 패키지를 만들어 분류합니다. 새 코드 작성 시 아래 **camelCase** 규칙을 따릅니다:

```
com.teamproject.workhub.entity.{domain}Entity/
com.teamproject.workhub.dto.{domain}Dto/
com.teamproject.workhub.repository.{domain}Repository/
com.teamproject.workhub.service.{domain}Service/
com.teamproject.workhub.controller.{domain}Controller/
```

### 3.2 Entity 작성 패턴

```java
package com.teamproject.workhub.entity.{domain}Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "테이블명_복수형")
@Getter
@Setter                    // 필요 시. 비즈니스 메서드로 대체 가능
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "snake_case_name", nullable = false)
    private String fieldName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_id", nullable = false)
    private RelatedEntity related;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private StatusEnum status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 비즈니스 메서드 - 상태 변경 로직을 Entity에 캡슐화
    public void updateStatus(StatusEnum newStatus) {
        this.status = newStatus;
    }

    @PrePersist
    protected void onCreate() {
        if (this.status == null) this.status = StatusEnum.DEFAULT;
    }
}
```

핵심 규칙:
- PK: `Long id` + `GenerationType.IDENTITY`
- 테이블명: snake_case 복수형 (users, tasks, attendance)
- 컬럼명: snake_case (`@Column(name = "...")`)
- Enum: `@Enumerated(EnumType.STRING)`
- 관계: `FetchType.LAZY` 기본
- 비즈니스 로직은 Entity 메서드로 캡슐화

### 3.3 DTO 작성 패턴

**Request DTO** (클라이언트 → 서버):
```java
@Getter @Setter
public class {Action}Request {
    private String field1;
    private Long field2;
}
```

**Response DTO** (서버 → 클라이언트):
```java
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class {Domain}ResponseDto {
    private Long id;
    private String field1;

    // Entity → DTO 변환 (반드시 정적 팩토리 메서드)
    public static {Domain}ResponseDto from({Entity} entity) {
        return {Domain}ResponseDto.builder()
                .id(entity.getId())
                .field1(entity.getField1())
                .build();
    }
}
```

핵심: Response DTO에는 반드시 **`from(Entity)` 정적 팩토리 메서드**를 포함합니다.

### 3.4 Repository 패턴

```java
@Repository
public interface {Domain}Repository extends JpaRepository<{Entity}, Long> {
    // Spring Data JPA 파생 쿼리
    List<Entity> findByFieldOrderByDateDesc(Type field);
    Optional<Entity> findByUniqueField(Type field);

    // 복잡한 쿼리는 @Query JPQL
    @Query("SELECT e FROM Entity e WHERE e.field.id = :id")
    Optional<Entity> findByFieldId(@Param("id") Long id);
}
```

주의: detached 객체 문제 방지를 위해 `findByUserId(Long id)` 같은 **ID 기반 쿼리 권장**.

### 3.5 Service 패턴

```java
@Service
@RequiredArgsConstructor
@Transactional
public class {Domain}Service {
    private final {Domain}Repository repository;

    // 조회
    public ResponseDto getById(Long id) {
        Entity entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("메시지: " + id));
        return ResponseDto.from(entity);
    }

    // 생성
    @Transactional
    public Entity create(Request request) {
        Entity entity = Entity.builder().field(request.getField()).build();
        return repository.save(entity);
    }

    // 수정 (더티 체킹)
    @Transactional
    public Entity update(Long id, UpdateRequest request) {
        Entity entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("메시지: " + id));
        entity.setField(request.getField());
        return entity;  // @Transactional → 자동 저장
    }

    // 삭제
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new IllegalArgumentException("메시지: " + id);
        repository.deleteById(id);
    }
}
```

핵심:
- `@RequiredArgsConstructor` 생성자 주입
- 에러: `IllegalArgumentException` / `RuntimeException`
- 수정: **더티 체킹** 활용
- 읽기 전용은 `@Transactional(readOnly = true)` 가능

### 3.6 Controller 패턴

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/{domain}")
public class {Domain}Controller {
    private final {Domain}Service service;

    // 세션 인증 확인 패턴
    // HttpSession session = request.getSession(false);
    // if (session == null || session.getAttribute("loginUser") == null)
    //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
    // User loginUser = (User) session.getAttribute("loginUser");

    @GetMapping
    public List<ResponseDto> getAll() { ... }

    @GetMapping("/{id}")
    public ResponseDto getById(@PathVariable Long id) { ... }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateRequest request,
                                     HttpServletRequest httpRequest) { ... }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> update(@PathVariable Long id,
                                               @RequestBody UpdateRequest request) { ... }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) { ... }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResponseDto> updateStatus(@PathVariable Long id,
                                                     @RequestBody Map<String, String> request) { ... }
}
```

### 3.7 API URL 설계 규칙

```
GET    /api/{domain}              전체 목록
GET    /api/{domain}/{id}         상세 조회
POST   /api/{domain}              생성
PUT    /api/{domain}/{id}         전체 수정
PATCH  /api/{domain}/{id}/status  상태 변경
DELETE /api/{domain}/{id}         삭제
GET    /api/{domain}/me           내 데이터
POST   /api/{domain}/check-in     출근
POST   /api/{domain}/check-out    퇴근
```

관리자 전용: `/api/admin/{resource}` (예: `/api/admin/register`)

---

## 4. 프론트엔드 개발 컨벤션

### 4.1 페이지 컴포넌트 패턴

```tsx
"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"

export default function PageName() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [user, isLoading, router])

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex flex-1 flex-col pl-[240px] transition-all duration-300">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] p-6">
            {/* 콘텐츠 */}
          </div>
        </main>
      </div>
    </div>
  )
}
```

### 4.2 API 통신

```typescript
const response = await fetch("/api/endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",  // 세션 쿠키 필수!
  body: JSON.stringify(data),
})
```

- Next.js rewrites: `/api/*` → `http://localhost:8080/api/*`
- **`credentials: "include"` 필수** (세션 쿠키)

### 4.3 인증 Context

`useAuth()` → `{ user, isLoading, login, logout }`
- 로그인: `login(employeeNo, password)` → checkLogin API → 상태 설정 → "/" 리다이렉트
- 로그아웃: `logout()` → user null → "/login" 리다이렉트

---

## 5. 새 기능 추가 체크리스트

### 백엔드 (순서)

1. Enum 정의 (필요 시): `entity/{domain}Entity/{Status}.java`
2. Entity: `entity/{domain}Entity/{Domain}.java`
3. Request DTO: `dto/{domain}Dto/{Action}Request.java`
4. Response DTO: `dto/{domain}Dto/{Domain}ResponseDto.java` (with `from()`)
5. Repository: `repository/{domain}Repository/{Domain}Repository.java`
6. Service: `service/{domain}Service/{Domain}Service.java`
7. Controller: `controller/{domain}Controller/{Domain}Controller.java`

### 프론트엔드 (순서)

1. API 함수: `lib/api.ts`에 추가
2. 컴포넌트: `components/dashboard/{feature}-*.tsx`
3. 페이지: `app/{route}/page.tsx` (인증 가드 포함)
4. 사이드바 메뉴: `components/dashboard/sidebar-nav.tsx`

---

## 6. 자주 하는 실수 방지

| 실수 | 해결 방법 |
|------|-----------|
| JPA Detached Entity 비교 실패 | `findByUser(user)` 대신 `findByUserId(user.getId())` 사용 |
| 세션 NullPointerException | `getSession(false)` + null 체크 |
| 프론트엔드 401 에러 | `credentials: "include"` 확인 |
| CORS 에러 | SecurityConfig + WebConfig 양쪽 Origin 추가 |
| DTO 역직렬화 실패 | Request DTO에 `@Setter` 확인 |

더 자세한 도메인별 구현 예시는 `references/domain-models.md`를 참조하세요.

---

## 7. 기존 도메인 모델

| 도메인 | Entity | 주요 기능 | API 경로 |
|--------|--------|-----------|----------|
| User | User, Role | 로그인/등록, 비밀번호 관리 | /api/login, /api/admin/register |
| Employee | Employee | 사원 정보 CRUD | /api/employee |
| Department | Department | 부서 관리 | - |
| Attendance | Attendance, AttendanceStatus | 출퇴근, 근태 이력 | /api/attendance |
| Board | Board, Importance | 공지사항 CRUD | /api/board |
| Task | Task, TaskStatus | 업무 할당/관리 | /api/task |
