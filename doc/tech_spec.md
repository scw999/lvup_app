# LV UP 웹앱 기술문서 v1.1

## 문서 정보
- **버전**: v1.1
- **이전 버전**: v1.0 (외부 AI 세션에서 작성)
- **갱신일**: 2026-04-11
- **참조 PRD**: docs/PRD.md (LV UP 웹앱 기획서 v2.1)

## 문서 목적
이 문서는 LV UP MVP를 실제로 구현하기 위한 기술 기준 문서입니다.
제품 PRD에서 확정된 구조를 바탕으로, 데이터 모델, API, 프론트엔드 구조, 업로드 방식, 상태 관리, 우선 개발 순서를 개발자가 바로 착수할 수 있는 수준으로 정리합니다.

## v1.0 → v1.1 주요 변경 사항

| 영역 | v1.0 | v1.1 |
|---|---|---|
| 인증 라이브러리 | Better Auth 우선 | **Lucia Auth 우선** (Edge runtime 호환성) + 폴백 전략 |
| D1 마이그레이션 | 명령어 누락 | **전체 흐름 명시** (생성 → 마이그레이션 → 적용) |
| PWA 설정 | Sprint 5 | **Sprint 1 (placeholder만)** + Sprint 5 (완성) |
| XP 필드 | 단일 xp | **3단 분리 (base/evidence/bonus)** — Phase 2 예약 |
| 서사 메시지 | 한 줄 언급 | **전용 모듈 명세 + 풀 구조 정의** |
| 환경변수 | .env만 | **.env + wrangler.toml + secrets 3계층 명시** |

---

# 1. 기술 목표

## 1.1 MVP 핵심 루프
구현해야 하는 최소 핵심 루프는 아래와 같습니다.

1. 가입 / 로그인
2. 클래스 + 역할 태그 + 첫 목표 선택
3. 상태창 생성
4. 기본 퀘스트 자동 생성
5. 퀘스트 수행
6. 이미지/텍스트 인증 제출
7. XP / 스탯 / 레벨 반영
8. 성장 로그 기록
9. 다음 퀘스트 예고 표시

## 1.2 기술 원칙
- 모바일 우선
- 빠른 첫 실행
- 인증 업로드는 간단하고 빠르게
- 기본 보상은 즉시 반영
- 구조는 단순하게, 확장 가능성은 열어둘 것
- P0 기준으로 먼저 끝까지 도는 흐름을 만든 뒤 고도화
- **Phase 2 확장 포인트는 미리 데이터 구조에 예약** (마이그레이션 비용 최소화)

---

# 2. 기술 스택

## 2.1 확정 스택
- Frontend: Next.js 14+ (App Router, TypeScript)
- Styling: Tailwind CSS
- Hosting: Cloudflare Pages
- API: Next.js Route Handlers
- Database: Cloudflare D1 (SQLite)
- ORM: Drizzle ORM
- Storage: Cloudflare R2
- **Auth: Lucia Auth (1순위) → 자체 구현 (2순위) → Better Auth (3순위)**
- Analytics: Cloudflare Web Analytics
- State: React Query + Zustand 최소 구조
- PWA: next-pwa 또는 수동 manifest + service worker

## 2.2 선택 기준

### Next.js
- 라우팅/레이아웃 관리가 좋음
- 앱 화면과 랜딩을 같이 운영 가능
- 추후 SEO, 콘텐츠 페이지, 소설/IP 연동에 유리

### D1
- MVP 규모에서 충분
- Cloudflare 생태계 통합 쉬움
- Drizzle과 궁합 좋음

### R2
- 이미지 인증 저장에 적합
- egress 무료 구조가 유리

### Auth 라이브러리 선택의 복잡성 (v1.1 신규)

Cloudflare Pages는 Edge runtime에서 동작하기 때문에 Node.js API 일부가 사용 불가능합니다.
이로 인해 일반적인 Node.js 기반 인증 라이브러리는 호환성 문제가 발생할 수 있습니다.

**우선순위:**

1. **Lucia Auth (1순위)**
   - Edge runtime 호환성이 검증됨
   - Drizzle과 자연스럽게 연동
   - 이메일/비밀번호부터 OAuth까지 점진적 확장 가능
   - 단점: 학습 곡선이 약간 있음

2. **자체 구현 (2순위)**
   - 라이브러리: bcrypt-edge (또는 Web Crypto API), jose (JWT)
   - 구현 범위: 가입, 로그인, 세션 쿠키, 미들웨어 보호
   - 약 200~300줄로 구현 가능
   - Lucia가 막힐 경우 폴백
   - 장점: 의존성 최소, Edge runtime 100% 호환
   - 단점: 보안 검토를 본인이 책임져야 함

3. **Better Auth (3순위)**
   - 기능은 가장 풍부
   - 단점: Edge runtime 호환성이 아직 완전히 검증되지 않음
   - Lucia/자체 구현 둘 다 막히는 경우에만 시도

**결정 시점**: Sprint 1 첫날에 Lucia로 빈 가입/로그인 페이지를 만들어보고, 30분 안에 작동하지 않으면 자체 구현으로 전환합니다.

---

# 3. 시스템 아키텍처

## 3.1 개요

```text
[Client / PWA]
  ↓
[Next.js App Router @ Cloudflare Pages]
  ↓
[Route Handlers (Edge Runtime)]
  ↓
[D1 Database]   [R2 Storage]
```

## 3.2 책임 분리

### 프론트엔드
- 화면 렌더링
- 입력/업로드 UX
- 상태창 표시
- 퀘스트/인증/로그 UI

### API (Route Handlers)
- 인증/권한 확인
- 퀘스트 생성/조회/완료
- 보상 계산 (서비스 함수 호출)
- 성장 로그 기록
- R2 업로드 토큰 발급

### DB
- 사용자 정보
- 상태창 스탯
- 퀘스트
- 인증
- 로그
- 뱃지/역할 태그

### 서비스 레이어 (lib/)
- 보상 계산
- 서사 메시지 생성
- 레벨업 판정
- DB 쿼리/변경

---

# 4. 권장 폴더 구조

```text
lvup_app/
├── README.md
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── drizzle.config.ts
├── wrangler.toml                # Cloudflare 바인딩 설정
├── .env.local                   # 로컬 개발용 환경변수
├── .env.example                 # 환경변수 템플릿
├── docs/
│   ├── PRD.md
│   ├── TECH_SPEC.md             # 이 문서
│   └── BUSINESS_PLAN.md
├── public/
│   ├── manifest.json            # PWA (Sprint 1부터 placeholder)
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # 랜딩
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── (app)/
│   │   │   ├── status/page.tsx
│   │   │   ├── quests/page.tsx
│   │   │   ├── quests/[id]/page.tsx
│   │   │   ├── log/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       ├── onboarding/
│   │       ├── status/
│   │       ├── quests/
│   │       ├── verifications/
│   │       ├── uploads/
│   │       └── log/
│   ├── components/
│   │   ├── ui/                  # 공통 UI primitives
│   │   ├── layout/
│   │   ├── status/
│   │   ├── quests/
│   │   ├── verification/
│   │   └── log/
│   ├── lib/
│   │   ├── auth/                # 인증 로직 (Lucia 또는 자체 구현)
│   │   ├── db/
│   │   │   ├── client.ts        # D1 클라이언트
│   │   │   ├── schema.ts        # Drizzle 스키마 정의
│   │   │   ├── queries/         # 읽기 전용 함수
│   │   │   └── mutations/       # 쓰기 함수 (트랜잭션 포함)
│   │   ├── rewards/
│   │   │   ├── calculate.ts     # 보상 계산
│   │   │   ├── narratives.ts    # 서사 메시지 풀 (v1.1 신규)
│   │   │   └── levels.ts        # 레벨업 계산
│   │   ├── stats/
│   │   ├── uploads/             # R2 presign 등
│   │   ├── quests/
│   │   │   └── starter.ts       # 클래스+목표별 초기 퀘스트
│   │   ├── types/
│   │   └── utils/
│   ├── hooks/
│   ├── stores/                  # Zustand
│   └── styles/
└── migrations/                  # Drizzle 마이그레이션 파일
```

## 4.1 구조 원칙
- app/api는 thin controller — 요청 검증과 응답만 담당
- 실제 로직은 lib 아래 서비스성 함수로 분리
- DB 쿼리는 queries / mutations로 분리
- 보상 계산 로직은 rewards에 집중
- 서사 메시지는 별도 모듈 (narratives.ts)
- 업로드 로직은 uploads 모듈로 격리

---

# 5. 데이터 모델 설계

아래는 MVP 기준 핵심 테이블입니다.
**v1.1 변경**: Phase 2 확장을 위한 필드를 미리 예약하여 마이그레이션 비용을 줄입니다.

## 5.1 users
사용자 기본 정보

| 필드 | 타입 | 설명 |
|---|---|---|
| id | text PK | 사용자 ID |
| email | text unique | 이메일 |
| password_hash | text nullable | 이메일 로그인 비밀번호 |
| nickname | text | 닉네임 |
| class_code | text | builder / creator / leader / explorer / supporter |
| first_goal | text | habit / project / income / team |
| level | integer | 현재 레벨 |
| title | text | 현재 칭호 (예: "입장한 자") |
| xp | integer | 현재 누적 XP |
| xp_to_next | integer | 다음 레벨 필요 XP |
| streak_days | integer | 연속 수행 일수 |
| last_active_date | text | 마지막 활동일 |
| created_at | text | 생성일 |
| updated_at | text | 수정일 |

**v1.1 추가 필드:**
- `title` — 레벨별 칭호 (PRD Part 11.4 참조)

## 5.2 user_stats
메인 스탯

| 필드 | 타입 | 설명 |
|---|---|---|
| user_id | text PK | 사용자 ID |
| vitality | integer | 체력 |
| focus | integer | 집중력 |
| execution | integer | 실행력 |
| knowledge | integer | 지식력 |
| relationship | integer | 관계력 |
| influence | integer | 전파력 |
| updated_at | text | 수정일 |

## 5.3 user_role_tags
사용자 역할 태그

| 필드 | 타입 | 설명 |
|---|---|---|
| id | text PK | 태그 ID |
| user_id | text | 사용자 ID |
| tag_code | text | dev / design / research 등 |
| tag_name | text | 표시 이름 |
| created_at | text | 생성일 |

## 5.4 quests
퀘스트 기본 정보

| 필드 | 타입 | 설명 |
|---|---|---|
| id | text PK | 퀘스트 ID |
| user_id | text | 사용자 ID |
| title | text | 제목 |
| description | text | 설명 |
| type | text | daily / story / custom / project |
| difficulty | text | easy / normal / hard / epic |
| main_stat_type | text | 연결 메인 스탯 |
| xp_reward_base | integer | 기본 XP |
| stat_reward | integer | 스탯 증가량 (난이도별 1/2/3/5) |
| status | text | active / completed / archived |
| estimated_minutes | integer | 예상 시간 |
| due_date | text nullable | 기한 |
| completed_at | text nullable | 완료 시각 |
| created_at | text | 생성일 |

**v1.1 추가 필드:**
- `stat_reward` — 난이도에 따른 스탯 증가량 (PRD Part 20.3)

## 5.5 verifications
퀘스트 인증의 상위 엔터티

| 필드 | 타입 | 설명 |
|---|---|---|
| id | text PK | 인증 ID |
| quest_id | text | 퀘스트 ID |
| user_id | text | 사용자 ID |
| note | text nullable | 한 줄 메모 |
| representative_image_url | text nullable | 대표 이미지 |
| link_url | text nullable | 외부 링크 (GitHub/Notion 등) |
| text_only | integer | 텍스트-only 여부 (0/1) |
| **xp_base_earned** | integer | **수행 XP** |
| **xp_evidence_earned** | integer | **증빙 XP** |
| **xp_bonus_earned** | integer | **기여 XP (Phase 2 예약, 일단 0)** |
| **xp_total_earned** | integer | **총 XP (저장된 합계)** |
| narrative_message | text | 보상 시 표시된 서사 메시지 (기록용) |
| created_at | text | 생성일 |

**v1.1 핵심 변경:**
- XP를 3단(base/evidence/bonus)으로 분리 저장 → PRD v2.1의 3단 XP 구조 반영
- `bonus`는 Phase 2 Verdict 시스템 도입 시 채워짐, MVP에서는 항상 0
- `xp_total_earned`는 저장된 합계 (계산 비용 절감)
- `narrative_message`는 사용자가 받았던 메시지를 저장 (성장 로그에서 다시 보여줄 때 사용)
- `link_url` 추가 — PRD Part 10.2의 인증 방식

## 5.6 quest_media
추가 이미지 첨부

| 필드 | 타입 | 설명 |
|---|---|---|
| id | text PK | 미디어 ID |
| verification_id | text | 인증 ID |
| image_url | text | 이미지 URL |
| sort_order | integer | 정렬 |
| created_at | text | 생성일 |

## 5.7 growth_log
일별 성장 로그

| 필드 | 타입 | 설명 |
|---|---|---|
| id | text PK | 로그 ID |
| user_id | text | 사용자 ID |
| date | text | 날짜 (YYYY-MM-DD) |
| quests_completed | integer | 완료 퀘스트 수 |
| xp_earned | integer | 획득 XP 합계 |
| vitality_delta | integer | 체력 변화 |
| focus_delta | integer | 집중력 변화 |
| execution_delta | integer | 실행력 변화 |
| knowledge_delta | integer | 지식력 변화 |
| relationship_delta | integer | 관계력 변화 |
| influence_delta | integer | 전파력 변화 |
| level_at_end | integer | 그날 종료 시점 레벨 |
| summary_text | text nullable | 요약 |
| created_at | text | 생성일 |

**Unique 제약**: (user_id, date)

## 5.8 level_events (v1.1 신규)
레벨업 발생 이벤트 (성장 로그에서 특별 표시용)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | text PK | 이벤트 ID |
| user_id | text | 사용자 ID |
| from_level | integer | 이전 레벨 |
| to_level | integer | 새 레벨 |
| new_title | text | 새로 획득한 칭호 |
| triggered_by_verification_id | text nullable | 어떤 인증에서 발생했는지 |
| created_at | text | 생성일 |

## 5.9 badges
뱃지 정의 (Phase 1 후반 또는 Phase 2)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | text PK | 뱃지 ID |
| code | text unique | 내부 코드 |
| name | text | 표시명 |
| description | text | 설명 |
| category | text | certification / contribution / mastery / title |
| created_at | text | 생성일 |

## 5.10 user_badges
사용자 보유 뱃지

| 필드 | 타입 | 설명 |
|---|---|---|
| id | text PK | 관계 ID |
| user_id | text | 사용자 ID |
| badge_id | text | 뱃지 ID |
| acquired_at | text | 획득일 |

---

# 6. Drizzle 스키마 작성 원칙

## 6.1 네이밍
- DB는 snake_case
- TypeScript 타입은 camelCase 매핑 허용
- Drizzle의 `text('column_name')` 패턴 활용

## 6.2 enum 처리
SQLite 제약상 text + check constraint 또는 앱 레벨 enum 검증 병행

```ts
// 예시
export const classCodes = ['builder', 'creator', 'leader', 'explorer', 'supporter'] as const;
export type ClassCode = typeof classCodes[number];
```

## 6.3 timestamps
- 기본은 ISO string 저장 (`datetime('now')` 활용)
- created_at / updated_at 필수
- 트리거 대신 앱 레벨에서 처리 (D1은 트리거 지원 제한적)

## 6.4 soft delete
MVP에선 불필요
- quests는 status로 관리
- media는 실제 삭제 가능

## 6.5 ID 생성
- UUID v7 또는 nanoid 권장 (시간 정렬 가능)
- prefix 사용: `usr_`, `qst_`, `vrf_` (디버깅 편의)

---

# 7. D1 마이그레이션 흐름 (v1.1 신규)

D1 + Drizzle을 처음 다루는 경우 가장 헷갈리는 부분입니다.
정확한 흐름을 아래에 명시합니다.

## 7.1 초기 1회 설정

```bash
# 1. Wrangler 설치 및 로그인 (전역)
npm install -g wrangler
wrangler login

# 2. 프로젝트 디렉토리에서 D1 생성
npx wrangler d1 create lvup-db

# → 출력 예시:
# [[d1_databases]]
# binding = "DB"
# database_name = "lvup-db"
# database_id = "abc123-xyz789-..."

# 3. 위 출력을 wrangler.toml에 복사
```

## 7.2 wrangler.toml 예시

```toml
name = "lvup-app"
compatibility_date = "2026-04-11"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "lvup-db"
database_id = "abc123-xyz789-..."  # 위에서 받은 ID

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "lvup-verifications"

[vars]
APP_URL = "https://lvup.world"
# 민감정보는 secrets로 관리 (아래 17.3 참조)
```

## 7.3 drizzle.config.ts

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
} satisfies Config;
```

## 7.4 마이그레이션 생성 및 적용

```bash
# 1. 스키마 변경 후 마이그레이션 파일 생성
npx drizzle-kit generate

# → migrations/0000_initial.sql 같은 파일이 생성됨

# 2. 로컬 D1에 적용 (개발 중)
npx wrangler d1 migrations apply lvup-db --local

# 3. 프로덕션 D1에 적용 (배포 직전)
npx wrangler d1 migrations apply lvup-db --remote

# 4. 직접 SQL 실행 (디버깅)
npx wrangler d1 execute lvup-db --local --command "SELECT * FROM users LIMIT 5"
npx wrangler d1 execute lvup-db --remote --command "SELECT * FROM users LIMIT 5"
```

## 7.5 흔한 함정

1. **--local / --remote 헷갈림**: 개발 중에는 항상 `--local`. 배포 직전에만 `--remote`.
2. **bindings 누락**: wrangler.toml의 binding 이름과 코드의 `env.DB`가 일치해야 함.
3. **Edge runtime 컨텍스트**: Route Handler에서 D1 접근 시 `getRequestContext()` 또는 `next-on-pages`의 헬퍼 사용 필요.
4. **마이그레이션 실수**: 스키마 변경 → generate → apply 순서 지키기. generate 없이 apply하면 변경 안 됨.

---

# 8. API 설계

API는 MVP 기준으로 기능별 최소 세트부터 시작합니다.

## 8.1 인증/Auth

### POST /api/auth/signup
신규 가입

요청:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "창완"
}
```

응답:
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "nickname": "창완"
  }
}
```

### POST /api/auth/login
로그인

### POST /api/auth/logout
로그아웃

### GET /api/auth/session
세션 확인

---

## 8.2 온보딩

### POST /api/onboarding/complete
온보딩 완료 및 초기 상태 생성

요청:
```json
{
  "classCode": "builder",
  "roleTags": ["design", "development"],
  "firstGoal": "project"
}
```

처리 (단일 트랜잭션):
- users 업데이트 (class_code, first_goal, title="입장한 자")
- user_stats 생성 (클래스에 따른 초기값)
- user_role_tags 생성 (1~3개)
- 기본 퀘스트 3개 자동 생성 (Section 16 참조)

응답:
```json
{
  "success": true,
  "createdQuestIds": ["qst_001", "qst_002", "qst_003"],
  "firstQuestId": "qst_001"
}
```

---

## 8.3 상태창

### GET /api/status
상태창 메인 데이터 조회

응답 예시:
```json
{
  "user": {
    "nickname": "창완",
    "classCode": "builder",
    "level": 2,
    "title": "자각한 자",
    "xp": 40,
    "xpToNext": 150,
    "streakDays": 3
  },
  "stats": {
    "vitality": 12,
    "focus": 15,
    "execution": 18,
    "knowledge": 11,
    "relationship": 10,
    "influence": 9
  },
  "statsDelta7d": {
    "vitality": 2,
    "focus": 5,
    "execution": 7,
    "knowledge": 1,
    "relationship": 0,
    "influence": 0
  },
  "todayMainQuest": {
    "id": "qst_123",
    "title": "20분 집중 작업하기",
    "mainStatType": "focus",
    "xpRewardBase": 15,
    "estimatedMinutes": 20
  },
  "nextUnlockHint": "3일 연속 달성 시 새로운 퀘스트 해금"
}
```

**v1.1 변경**: `statsDelta7d` 추가 — PRD Part 5.3의 "최근 7일 변화량" 표시용

---

## 8.4 퀘스트

### GET /api/quests
퀘스트 목록 조회
쿼리 파라미터:
- `type=daily` / `custom` / `story`
- `status=active` / `completed`

### GET /api/quests/:id
퀘스트 상세 조회

### POST /api/quests
커스텀 퀘스트 생성

요청:
```json
{
  "title": "설계안 1차 수정하기",
  "description": "평면과 동선 수정",
  "type": "custom",
  "difficulty": "normal",
  "mainStatType": "execution",
  "estimatedMinutes": 45
}
```

### POST /api/quests/:id/complete
퀘스트 완료 처리 준비
**주의**: 실제 보상 지급은 verification 제출 시점과 묶음 (Section 14 트랜잭션)

---

## 8.5 업로드

### POST /api/uploads/presign
R2 업로드용 presigned URL 발급

요청:
```json
{
  "contentType": "image/jpeg",
  "fileName": "quest-photo.jpg"
}
```

응답:
```json
{
  "uploadUrl": "https://...",
  "fileUrl": "https://pub-xxxx.r2.dev/...",
  "expiresAt": "2026-04-11T12:00:00Z"
}
```

---

## 8.6 인증 제출

### POST /api/verifications
퀘스트 인증 제출 및 보상 계산

요청:
```json
{
  "questId": "qst_123",
  "note": "20분 집중해서 설계 수정 완료",
  "representativeImageUrl": "https://.../main.jpg",
  "additionalImageUrls": [
    "https://.../1.jpg",
    "https://.../2.jpg"
  ],
  "linkUrl": null
}
```

처리 (단일 트랜잭션, Section 14 참조):
- verification 생성
- quest_media 생성
- quests.status = completed
- 보상 계산 (3단 XP)
- users.xp / level / title 반영
- user_stats 반영
- growth_log upsert
- level_events insert (레벨업 시)

응답:
```json
{
  "success": true,
  "reward": {
    "xpBase": 15,
    "xpEvidence": 7,
    "xpBonus": 0,
    "xpTotal": 22,
    "statType": "focus",
    "statDelta": 2,
    "leveledUp": false,
    "newLevel": null,
    "newTitle": null,
    "narrativeMessage": "오늘 너의 시간은 흩어지지 않았다. 집중의 룬이 새겨졌다."
  }
}
```

**v1.1 변경**: `xpBase / xpEvidence / xpBonus`로 분리 응답 → 보상 화면에서 단계별 표시 가능

---

## 8.7 성장 로그

### GET /api/log
성장 로그 목록 조회 (최근 30일 기본)

### GET /api/log/daily?date=2026-04-11
특정 일자 성장 로그 조회

### GET /api/log/heatmap?weeks=12
캘린더 히트맵용 데이터 (최근 N주)

응답:
```json
{
  "days": [
    { "date": "2026-04-11", "xpEarned": 25, "questsCompleted": 2 },
    { "date": "2026-04-10", "xpEarned": 0, "questsCompleted": 0 },
    ...
  ]
}
```

---

# 9. 보상 계산 로직

보상 로직은 별도 모듈로 분리합니다.

## 9.1 기본 규칙
- 퀘스트 완료 시 base XP 지급
- 메모/이미지 증빙이 있으면 evidence XP 추가
- (Phase 2) Verdict 평가 시 bonus XP 추가
- 관련 메인 스탯 증가
- 레벨업 여부 계산
- growth_log 기록

## 9.2 함수 구조 (lib/rewards/)

```ts
// lib/rewards/calculate.ts
export type RewardInput = {
  quest: Quest;
  hasNote: boolean;
  hasRepresentativeImage: boolean;
  additionalImageCount: number;
  hasLink: boolean;
  streakDays: number;
};

export type RewardResult = {
  xpBase: number;
  xpEvidence: number;
  xpBonus: number;       // Phase 2, MVP에서는 항상 0
  xpTotal: number;
  statType: MainStatType;
  statDelta: number;
  narrativeMessage: string;
};

export function calculateQuestReward(input: RewardInput): RewardResult;

// lib/rewards/levels.ts
export function getXpToNext(level: number): number;
export function checkLevelUp(currentXp: number, currentLevel: number): {
  leveledUp: boolean;
  newLevel: number;
  newTitle: string;
};

// lib/rewards/narratives.ts (v1.1 신규 — 9.5 참조)
export function getNarrativeMessage(statType: MainStatType, context?: NarrativeContext): string;
```

## 9.3 XP 규칙

| 난이도 | 기본 XP | 스탯 증가 |
|---|---|---|
| easy | 5~10 | +1 |
| normal | 10~20 | +2 |
| hard | 20~40 | +3 |
| epic | 40~100 | +5 |

## 9.4 증빙 XP 규칙

| 조건 | 추가 XP |
|---|---|
| 메모 입력 (5자 이상) | +2 |
| 대표 이미지 첨부 | +3 |
| 추가 이미지 2장 이상 | +2 |
| 외부 링크 첨부 | +2 |
| 최대 합계 | +9 |

## 9.5 연속 수행 보너스

| 연속 일수 | 보너스 비율 | 추가 효과 |
|---|---|---|
| 2일~6일 | +10% | - |
| 7일~29일 | +25% | "흔들리지 않는 자" 배지 (P1) |
| 30일~99일 | +50% | 특별 칭호 (P1) |
| 100일+ | +75% | 전설급 칭호 (P1) |

**중요**: 연속이 끊겨도 레벨/스탯은 떨어지지 않음. **처벌이 아닌 보상 설계** (PRD Part 20.2).

## 9.6 레벨업 계산

```ts
export function getXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getTitleByLevel(level: number): string {
  const titles: Record<number, string> = {
    1: "입장한 자",
    2: "자각한 자",
    3: "첫 걸음을 뗀 자",
    4: "흔들리지 않는 자",
    5: "길을 찾은 자",
    6: "가속하는 자",
    7: "불꽃을 품은 자",
    8: "빛을 나누는 자",
    9: "길을 만드는 자",
    10: "각성한 자",
  };
  return titles[Math.min(level, 10)] ?? "각성한 자";
}
```

---

# 10. 서사 메시지 시스템 (v1.1 신규)

LV UP의 가장 큰 차별점입니다. 단순 "+10 XP" 대신 세계관이 살아있는 메시지를 표시합니다.
LiFE RPG 같은 경쟁 제품과 LV UP을 결정적으로 가르는 지점입니다.

## 10.1 구현 위치

`src/lib/rewards/narratives.ts`

## 10.2 데이터 구조 (Phase 1: 하드코딩)

```ts
// src/lib/rewards/narratives.ts

import type { MainStatType } from '@/lib/types';

const NARRATIVE_POOL: Record<MainStatType, string[]> = {
  vitality: [
    "오늘 너는 몸을 깨웠다. 내일의 너에게 선물이 되었다.",
    "체력은 모든 능력의 그릇이다. 그릇이 한 뼘 자랐다.",
    "한 발 더 뛴 자만이 다음 산을 본다.",
    "몸을 움직인 자에게 마음도 움직인다.",
    "오늘의 땀은 내일의 자유다.",
  ],
  focus: [
    "산만한 세상에서 한 점에 머무는 것은 가장 어려운 기술이다.",
    "오늘 너의 시간은 흩어지지 않았다. 집중의 룬이 새겨졌다.",
    "20분의 몰입이 한 시간의 산만함을 이긴다.",
    "주의를 모으는 자가 결국 가장 멀리 본다.",
    "집중은 의지가 아니라 훈련이다. 너는 훈련했다.",
  ],
  execution: [
    "오늘 너는 한계를 한 발짝 넘었다. 실행력이 강화되었다.",
    "생각만 하는 자와 실행하는 자 사이에 우주가 있다. 너는 우주를 건넜다.",
    "완벽한 시작은 없다. 시작한 자만이 도착한다.",
    "미루지 않은 하루는 미래를 바꾼다.",
    "오늘의 작은 실행이 내일의 큰 결과가 된다.",
  ],
  knowledge: [
    "새로운 지식이 시야를 넓혔다. 아직 읽지 않은 책장이 빛나고 있다.",
    "오늘 알게 된 것이 내일의 너를 다르게 만들 것이다.",
    "배우는 자는 어제의 자신을 매일 추월한다.",
    "한 줄의 통찰이 백 줄의 지식보다 무겁다.",
    "지식은 쌓이는 것이 아니라 연결되는 것이다.",
  ],
  relationship: [
    "새로운 연결이 생겼다. 세계는 혼자 넓히는 것이 아니다.",
    "오늘의 한마디가 누군가의 하루를 바꿨을 것이다.",
    "혼자 가면 빠르고, 함께 가면 멀리 간다. 너는 멀리 가는 길을 택했다.",
    "관계는 시간이 아니라 진심으로 깊어진다.",
    "타인을 돕는 자가 결국 자신을 돕는다.",
  ],
  influence: [
    "네 목소리가 한 사람에게 닿았다. 영향력은 거기서 시작된다.",
    "오늘 네가 쓴 것이 내일 누군가의 등불이 될지 모른다.",
    "전한다는 것은 가장 큰 학습이다. 너는 두 번 배웠다.",
    "남긴 것은 잊혀지지 않는다.",
    "가장 큰 보상은 다른 사람의 변화에서 온다.",
  ],
};

export function getNarrativeMessage(statType: MainStatType): string {
  const pool = NARRATIVE_POOL[statType];
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// 레벨업 메시지 (별도 처리)
const LEVELUP_MESSAGES = [
  "당신은 더 이상 어제의 당신이 아니다.",
  "한 단계의 벽을 넘은 자에게 새로운 풍경이 열린다.",
  "성장은 우연이 아니라 누적이다. 너는 누적했다.",
];

export function getLevelUpMessage(): string {
  return LEVELUP_MESSAGES[Math.floor(Math.random() * LEVELUP_MESSAGES.length)];
}
```

## 10.3 사용 예시

```ts
// src/app/api/verifications/route.ts
import { getNarrativeMessage } from '@/lib/rewards/narratives';

const reward = calculateQuestReward(input);
const narrative = getNarrativeMessage(reward.statType);

// reward 응답에 포함
return Response.json({
  success: true,
  reward: { ...reward, narrativeMessage: narrative },
});
```

## 10.4 Phase 2 확장 방향

- DB 테이블로 옮겨서 어드민에서 추가/수정 가능
- 사용자 레벨, 클래스, 시즌에 따라 다른 메시지 풀
- 컨텍스트 기반 (예: "10번째 운동 완료" → 특별 메시지)
- 사용자가 자기만의 메시지 작성 가능

## 10.5 작성 원칙

- 짧을 것 (1~2문장)
- 평가가 아니라 인정
- 추상적 격려 대신 구체적 행동에 대한 의미 부여
- 종교/철학적 색채 너무 강하지 않게
- 한국어 자연스러운 문장

---

# 11. 업로드 설계

## 11.1 권장 방식 (presigned URL)
1. 클라이언트가 presign 요청
2. R2에 직접 업로드
3. fileUrl 수신
4. verification API 호출 시 URL 전달

## 11.2 이유
- 서버 부하 감소
- 대용량 처리 유리
- 업로드 재시도 관리 쉬움
- Cloudflare Workers의 6MB 요청 크기 제한 우회

## 11.3 제약
- 1퀘스트당 대표 1장 + 추가 최대 10장
- 파일 크기 제한 (10MB 이하)
- 이미지 타입 제한 (jpg, png, webp)

## 11.4 UX 권장
- 업로드 진행률 표시
- 대표 이미지 먼저 선택
- 추가 첨부는 선택 옵션
- 실패 시 개별 재시도

---

# 12. 프론트엔드 화면 구조

PRD Part 16의 화면 구조를 그대로 따릅니다. 여기서는 기술적 구현 포인트만 정리합니다.

## 12.1 랜딩 (`/`)
- 정적 페이지 가능 (SSG)
- 단일 CTA: "상태창 열기"

## 12.2 로그인/가입 (`/login`, `/signup`)
- 클라이언트 컴포넌트
- 폼 검증: zod 사용 권장
- 에러 처리: 토스트 또는 인라인

## 12.3 온보딩 (`/onboarding`)
- 4단계 wizard
- 진행 상태는 Zustand로 관리
- 마지막 단계에서 단일 API 호출 (`/api/onboarding/complete`)

## 12.4 상태창 (`/status`)
- 메인 홈
- 서버 컴포넌트로 초기 데이터 로드 + React Query로 갱신
- 6스탯 그리드 + 메인 퀘스트 카드

## 12.5 퀘스트 목록 (`/quests`)
- 탭: Daily / Custom
- 인피니트 스크롤은 Phase 2

## 12.6 퀘스트 상세 (`/quests/[id]`)
- SSR 또는 client-side fetch
- "인증하기" 버튼 → 모달 또는 별도 페이지

## 12.7 인증 제출
- 모달 또는 `/quests/[id]/verify` 페이지
- 이미지 업로드 → presign → R2 → fileUrl 수집 → verification API
- 업로드 중 상태는 Zustand draft 저장

## 12.8 보상 화면
- 전체 화면 오버레이
- 애니메이션: Tailwind + CSS keyframes
- XP 카운트업 + 서사 메시지 + 스탯 증가
- 레벨업 시 특별 연출

## 12.9 성장 로그 (`/log`)
- 캘린더 히트맵 (라이브러리: react-activity-calendar 또는 자체 구현)
- 일별 상세 모달
- 인증 갤러리

---

# 13. 상태 관리 전략

## 13.1 서버 상태 (React Query)
- `useStatusQuery()` — 상태창
- `useQuestsQuery()` — 퀘스트 목록
- `useQuestQuery(id)` — 퀘스트 상세
- `useLogQuery()` — 성장 로그
- `useSessionQuery()` — 세션

## 13.2 클라이언트 상태 (Zustand)
- 온보딩 진행 상태 (`onboardingStore`)
- 업로드 중 임시 상태 (`uploadStore`)
- 인증 작성 draft (`verificationDraftStore`)

## 13.3 낙관적 업데이트
MVP에서는 최소화
- verification 제출 후 서버 응답 기준 반영 권장
- 업로드는 비동기 실패 가능성이 있어서 무리한 optimistic update 지양

---

# 14. 인증/권한

## 14.1 기본 규칙
- 자신의 퀘스트만 조회/완료 가능
- 자신의 인증만 제출 가능
- 비로그인 상태에서 앱 핵심 기능 접근 제한

## 14.2 미들웨어
`src/middleware.ts`로 라우트 보호:

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await getSession(request); // Lucia 또는 자체 구현

  // (app) 그룹 보호
  const protectedPaths = ['/status', '/quests', '/log', '/settings', '/onboarding'];
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 로그인된 사용자가 로그인 페이지 접근 시 리다이렉트
  if (session && ['/login', '/signup'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/status', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

# 15. 에러 처리 원칙

## 15.1 가입
- 이메일 중복 → 409 Conflict
- 비밀번호 규칙 위반 → 400 Bad Request
- 닉네임 중복은 MVP에선 허용

## 15.2 업로드
- 파일 타입 불일치 → 400
- 파일 크기 초과 → 413 Payload Too Large
- 업로드 실패 → 클라이언트에서 재시도 UI

## 15.3 인증 제출
- questId 없음 → 404
- 다른 사용자의 questId → 403
- 이미 완료된 퀘스트 중복 제출 → 409

## 15.4 보상 반영
- DB transaction 실패 시 전체 롤백
- verification 생성과 reward 적용은 같은 트랜잭션 안에서 처리

---

# 16. 트랜잭션 설계

인증 제출 시 아래를 하나의 흐름으로 처리합니다.

```ts
// src/lib/db/mutations/submitVerification.ts
export async function submitVerification(
  db: D1Database,
  input: SubmitVerificationInput
): Promise<SubmitVerificationResult> {
  return await db.batch([
    // 1. verification insert
    db.prepare(`INSERT INTO verifications (...) VALUES (...)`).bind(...),
    // 2. quest_media insert (각 추가 이미지)
    ...input.additionalImageUrls.map(url =>
      db.prepare(`INSERT INTO quest_media (...) VALUES (...)`).bind(...)
    ),
    // 3. quests.status = completed
    db.prepare(`UPDATE quests SET status = 'completed', completed_at = ? WHERE id = ?`).bind(...),
    // 4. users.xp / level / title 업데이트
    db.prepare(`UPDATE users SET xp = ?, level = ?, title = ? WHERE id = ?`).bind(...),
    // 5. user_stats 업데이트
    db.prepare(`UPDATE user_stats SET ${statColumn} = ${statColumn} + ? WHERE user_id = ?`).bind(...),
    // 6. growth_log upsert
    db.prepare(`INSERT INTO growth_log (...) VALUES (...) ON CONFLICT(user_id, date) DO UPDATE SET ...`).bind(...),
    // 7. (조건부) level_events insert
    ...(leveledUp ? [db.prepare(`INSERT INTO level_events (...) VALUES (...)`).bind(...)] : []),
  ]);
}
```

**주의**: D1의 `batch()`는 트랜잭션처럼 동작하지만, 일부 제약이 있습니다.
- 단일 RPC 안에서 처리 → 부분 실패 없음
- 단, 동적 SQL은 어렵기 때문에 조건부 쿼리는 코드 분기 필요

---

# 17. 환경변수 관리 (v1.1 확장)

Cloudflare 환경에서는 환경변수가 3계층으로 관리됩니다.

## 17.1 .env.local (로컬 개발용)

```env
# 로컬 개발 환경
DATABASE_URL=
APP_URL=http://localhost:3000

# Drizzle CLI용 (마이그레이션 생성/적용)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-d1-database-id
CLOUDFLARE_API_TOKEN=your-api-token

# 인증
AUTH_SECRET=generate-with-openssl-rand-base64-32
```

## 17.2 wrangler.toml ([vars] 섹션 — 공개 가능 변수)

```toml
[vars]
APP_URL = "https://lvup.world"
NODE_ENV = "production"
```

## 17.3 wrangler secrets (민감 정보 — 프로덕션)

```bash
# 한 번씩 실행해서 등록
npx wrangler secret put AUTH_SECRET
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
```

## 17.4 .env.example (Git에 커밋, 템플릿)

```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_DATABASE_ID=
CLOUDFLARE_API_TOKEN=

# Auth
AUTH_SECRET=

# App
APP_URL=http://localhost:3000
```

## 17.5 구분 원칙

| 종류 | 위치 | 예시 |
|---|---|---|
| 개발용 키 | .env.local | DB credential, API token |
| 공개 변수 | wrangler.toml [vars] | APP_URL, FEATURE_FLAGS |
| 프로덕션 비밀 | wrangler secrets | AUTH_SECRET, R2 키 |
| 리소스 바인딩 | wrangler.toml [[d1_databases]] 등 | DB, BUCKET, KV |

**.env.local은 절대 Git에 커밋하지 않습니다.** .gitignore에 포함 필수.

---

# 18. P0 개발 순서 (v1.1 갱신)

## Sprint 1 (3~5일) — 기반 + 인증 + 빈 화면
- [ ] 프로젝트 초기화 (Next.js 14, TypeScript, Tailwind)
- [ ] docs/ 폴더에 PRD, TECH_SPEC 정리
- [ ] wrangler.toml 작성
- [ ] D1 데이터베이스 생성 (`wrangler d1 create lvup-db`)
- [ ] Drizzle 스키마 작성 (Section 5)
- [ ] 첫 마이그레이션 생성 + 로컬 적용
- [ ] **PWA placeholder** (manifest.json + 빈 아이콘) ← v1.1 변경
- [ ] **Lucia Auth 시도 → 막히면 자체 구현** ← v1.1 변경
- [ ] 가입/로그인/로그아웃 작동
- [ ] 미들웨어로 보호 라우트 설정
- [ ] Cloudflare Pages 배포 → lvup.world 연결
- [ ] README.md 작성

**완료 기준**: 가입 후 빈 `/status` 페이지가 보호된 상태로 접근됨.

## Sprint 2 (3~5일) — 온보딩
- [ ] 온보딩 4단계 wizard
- [ ] 클래스 5개 카드 UI
- [ ] 역할 태그 다중 선택 UI
- [ ] 첫 목표 4개 선택 UI
- [ ] `/api/onboarding/complete` 구현
- [ ] 클래스+목표 조합별 기본 퀘스트 3개 자동 생성 (Section 19)
- [ ] 상태창 생성 연출 화면

**완료 기준**: 신규 가입 → 온보딩 완료 → 상태창에 첫 퀘스트가 보임.

## Sprint 3 (4~6일) — 상태창 + 퀘스트
- [ ] `/api/status` 구현
- [ ] 상태창 메인 화면 (6스탯 그리드 + 메인 퀘스트 카드)
- [ ] 7일 변화량 계산 로직
- [ ] 퀘스트 목록 화면 (Daily / Custom 탭)
- [ ] 퀘스트 상세 화면
- [ ] 커스텀 퀘스트 생성 (FAB → 모달)
- [ ] 다음 해금 안내 표시

**완료 기준**: 사용자가 상태창에서 퀘스트 목록을 보고, 새 퀘스트를 만들 수 있음.

## Sprint 4 (5~7일) — 인증 + 보상 (가장 중요)
- [ ] R2 버킷 생성 + presigned URL API
- [ ] 인증 제출 화면 (대표 이미지 + 추가 + 메모 + 링크)
- [ ] 클라이언트 → R2 직접 업로드
- [ ] `/api/verifications` 구현 (트랜잭션)
- [ ] 보상 계산 로직 (`lib/rewards/calculate.ts`)
- [ ] **서사 메시지 모듈** (`lib/rewards/narratives.ts`) ← v1.1 신규
- [ ] 레벨업 판정 (`lib/rewards/levels.ts`)
- [ ] 보상 화면 연출 (전체 오버레이)
- [ ] growth_log 자동 기록

**완료 기준**: 퀘스트 → 인증 → 보상까지 핵심 루프 1회 완주.
**이 시점이 LV UP의 진짜 탄생.**

## Sprint 5 (3~5일) — 성장 로그 + 다듬기
- [ ] `/api/log` + `/api/log/heatmap` 구현
- [ ] 캘린더 히트맵 화면
- [ ] 일별 상세 모달
- [ ] 인증 갤러리
- [ ] 모바일 UX 다듬기 (실제 폰에서 테스트)
- [ ] 에러 처리 강화
- [ ] **PWA 완성** (service worker, 아이콘, 홈 화면 추가) ← v1.1 변경

**완료 기준**: PWA로 홈 화면 추가 가능. 일주일치 데이터가 의미 있게 보임.

## Sprint 6 (선택) — 첫 베타
- [ ] 본인 사용 (Founder Quest)
- [ ] 친구 2~5명 초대
- [ ] 피드백 수집 구조
- [ ] 회고 + Phase 2 계획

---

# 19. 초기 자동 생성 퀘스트

온보딩 완료 시 클래스 + 첫 목표 조합에 따라 기본 퀘스트 3개를 자동 생성합니다.
구현은 `src/lib/quests/starter.ts`에 정의합니다.

## 19.1 제작자 | Builder

### + 프로젝트 시작
1. 오늘 만들 것 한 줄 정의하기 (execution, easy, 5분)
2. 20분 집중 작업하기 (focus, normal, 20분)
3. 작업 결과 이미지 남기기 (execution, easy, 5분)

### + 습관 만들기
1. 매일 할 작업 시간 정하기 (execution, easy, 5분)
2. 오늘 작업 환경 정리하기 (focus, easy, 10분)
3. 첫 결과물 한 조각 만들기 (execution, normal, 30분)

### + 수익 만들기
1. 팔 수 있는 것 한 가지 정의하기 (execution, easy, 10분)
2. 오늘 1시간 만들기 작업 (execution, normal, 60분)
3. 첫 결과물 사진 남기기 (influence, easy, 5분)

### + 새로운 사람 만나기
1. 함께 작업하고 싶은 사람 한 명 정하기 (relationship, easy, 5분)
2. 자기소개 한 줄 정리하기 (influence, easy, 10분)
3. 오늘 만든 것 누군가에게 보여주기 (relationship, normal, 15분)

## 19.2 창작자 | Creator

### + 프로젝트 시작
1. 오늘 표현할 주제 정하기 (knowledge, easy, 5분)
2. 15분 창작하기 (focus, normal, 15분)
3. 결과물 일부 공유하기 (influence, easy, 5분)

### + 습관 만들기
1. 매일 영감 1개 기록하기 (knowledge, easy, 5분)
2. 작은 작품 한 개 만들기 (execution, normal, 30분)
3. 만든 것에 대한 한 줄 메모 (influence, easy, 5분)

### + 수익 만들기
1. 팔 수 있는 작품 형태 정의하기 (execution, easy, 10분)
2. 첫 샘플 만들기 (execution, normal, 45분)
3. 누군가에게 피드백 받기 (relationship, easy, 10분)

### + 새로운 사람 만나기
1. 좋아하는 작가/창작자 1명 찾기 (knowledge, easy, 10분)
2. 그들에게 한 줄 메시지 쓰기 (relationship, easy, 10분)
3. 자기 작품 한 점 공유하기 (influence, normal, 15분)

## 19.3 주도자 | Leader

### + 프로젝트 시작
1. 프로젝트 한 줄 정의 (execution, easy, 5분)
2. 첫 마일스톤 정하기 (execution, easy, 10분)
3. 도와줄 사람 한 명 찾기 (relationship, normal, 15분)

### + 새로운 사람 만나기
1. 함께할 목표 정리하기 (execution, easy, 10분)
2. 팀 조건 한 줄로 정의하기 (knowledge, easy, 5분)
3. 오늘 한 번 대화 시도하기 (relationship, normal, 15분)

(나머지 조합은 위 패턴 따라 추가)

## 19.4 탐구자 | Explorer

### + 프로젝트 시작
1. 비슷한 사례 3개 조사하기 (knowledge, normal, 30분)
2. 핵심 인사이트 1개 정리하기 (knowledge, easy, 10분)
3. 오늘 배운 것 기록하기 (influence, easy, 5분)

(나머지 조합 추가)

## 19.5 조율자 | Supporter

### + 새로운 사람 만나기
1. 누군가에게 응원/피드백 남기기 (relationship, easy, 10분)
2. 대화 정리하기 (knowledge, easy, 5분)
3. 오늘 관계 행동 기록하기 (influence, easy, 5분)

(나머지 조합 추가)

## 19.6 구현 패턴

```ts
// src/lib/quests/starter.ts
type StarterQuestInput = {
  classCode: ClassCode;
  firstGoal: FirstGoal;
};

export function getStarterQuests(input: StarterQuestInput): NewQuest[] {
  const key = `${input.classCode}_${input.firstGoal}`;
  return STARTER_QUEST_MAP[key] ?? DEFAULT_STARTER_QUESTS;
}
```

전체 25개 조합 (5 클래스 × 5 목표) 중 핵심 조합부터 정의하고, 누락된 조합은 기본 세트로 폴백.

---

# 20. 향후 확장 포인트

## P1 (Phase 1 후반 또는 직후)
- 뱃지 발급 로직
- 상태창 해석 문구 다양화
- 스킬 구조 시각화
- 주간 회고 리포트
- 클래스별 추천 퀘스트 고도화

## P2 (Phase 2)
- Verdict 경량 인정 시스템
- **분야별 신뢰도 기반 Verdict 가중치** (PRD Part 13.5)
- 파티 / 프로젝트 퀘스트
- 길드 / 클랜
- 스토리 퀘스트 (소설 IP 연동)
- 푸시 알림
- 소셜 로그인

## P3 (Phase 3)
- 공익 퀘스트 / 후원 연동
- 콘텐츠형 세계관 확장
- 시즌 시스템
- 멘토 매칭

---

# 21. 최종 구현 기준 한 줄 요약

**기술적으로는 "유저 생성 → 상태창 생성 → 퀘스트 생성 → 이미지 인증 제출 → 보상 계산 → 서사 메시지 표시 → 성장 기록"이 끊기지 않고 안정적으로 도는 구조를 먼저 완성하는 것이 목표다.**

이 루프가 단단히 굴러가면, 그 위에 무엇을 얹어도 LV UP은 작동한다.

---

# 부록 A. Sprint 1 시작 체크리스트

개발 첫날 사용할 체크리스트입니다.

## 환경 준비
- [ ] Node.js 20+ 설치 확인 (`node -v`)
- [ ] npm 또는 pnpm 사용 결정
- [ ] Git 설정 확인
- [ ] Wrangler CLI 설치 (`npm i -g wrangler`)
- [ ] Wrangler 로그인 (`wrangler login`)
- [ ] Cloudflare 대시보드 접속 가능

## 프로젝트 초기화
- [ ] `npx create-next-app@latest` 실행
- [ ] App Router, TypeScript, Tailwind, ESLint 선택
- [ ] src/ 디렉토리 사용
- [ ] GitHub 레포(scw999/lvup_app)와 연결

## Cloudflare 통합
- [ ] `@cloudflare/next-on-pages` 설치
- [ ] `@cloudflare/workers-types` 설치
- [ ] wrangler.toml 작성
- [ ] D1 데이터베이스 생성
- [ ] R2 버킷 생성

## DB 설정
- [ ] Drizzle 설치 (`drizzle-orm`, `drizzle-kit`)
- [ ] schema.ts 작성 (Section 5)
- [ ] drizzle.config.ts 작성
- [ ] 첫 마이그레이션 생성 (`drizzle-kit generate`)
- [ ] 로컬 D1 적용 (`wrangler d1 migrations apply lvup-db --local`)
- [ ] 원격 D1 적용 (`wrangler d1 migrations apply lvup-db --remote`)

## 인증
- [ ] Lucia 시도 → 30분 안에 가입/로그인 작동 여부 판단
- [ ] 안 되면 자체 구현으로 전환
- [ ] 가입/로그인/로그아웃 페이지
- [ ] 미들웨어로 보호 라우트

## PWA placeholder
- [ ] public/manifest.json 작성 (최소 구성)
- [ ] public/icons/ 에 placeholder 아이콘 (512x512, 192x192)
- [ ] layout.tsx에 manifest 링크

## 배포
- [ ] Cloudflare Pages 프로젝트 연결 (이미 됨)
- [ ] 환경변수 등록 (wrangler secrets)
- [ ] 첫 배포 확인 (lvup.world에서 새 버전 보임)

## 문서
- [ ] README.md (프로젝트 개요, 개발 환경, 주요 명령어)
- [ ] docs/ 에 PRD, TECH_SPEC 정리

## 완료 기준
- [ ] `npm run dev` 작동
- [ ] localhost:3000 접속 가능
- [ ] 가입/로그인 작동 (실제 D1에 사용자 저장됨)
- [ ] 보호 라우트 작동 (`/status` 미로그인 시 `/login`으로)
- [ ] lvup.world에 새 빌드 배포됨

**이 체크리스트가 끝나면 Sprint 2 (온보딩)로 진입.**
