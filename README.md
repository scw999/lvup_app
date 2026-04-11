# LV UP

> **현실에서 행동한 모든 것이, 당신의 상태창이 된다.**

[![Status](https://img.shields.io/badge/status-MVP%20development-blue)](https://lvup.world)
[![Phase](https://img.shields.io/badge/phase-Sprint%201-yellow)]()
[![License](https://img.shields.io/badge/license-Proprietary-red)]()

🌍 **Live**: [lvup.world](https://lvup.world)
✉️ **Contact**: genesis@lvup.world

---

## LV UP은 무엇인가

LV UP은 **현실을 게임처럼 재설계하는 성장 RPG형 웹앱**입니다.

당신을 자기 인생의 CEO로 만듭니다. 거대한 목표를 작은 퀘스트로 쪼개서 하루에 하나씩 실행하고, 그 즉시 성장의 도파민을 느끼며, 매출과 선한 영향력을 통해 자아실현이라는 가장 높은 욕구까지 도달하게 합니다.

```
행동 → 인증 → 보상 → 성장 기록 → 다음 행동
```

이 단순한 5단계 루프가 LV UP의 모든 것입니다.

---

## 왜 이게 다른가

대부분의 자기계발 앱은 차갑고, 외롭고, 노션 템플릿처럼 사용자가 직접 다 설정해야 합니다. LV UP은 다르게 작동합니다.

| 일반 자기계발 앱 | LV UP |
|---|---|
| 도구를 직접 설정해야 함 | 이미 살아있는 세계에 입장 |
| "+10 XP" 같은 차가운 숫자 | 서사적 메시지로 보상 |
| 학력/자격증/스펙 평가 | 행동과 기여만 평가 |
| 랭킹과 비교의 굴욕 | 어제의 나와만 비교 |
| 도파민 루프에서 멈춤 | 자아실현까지 가는 사다리 |

핵심은 **3단 XP 구조**입니다:

- **수행 XP** — "나는 했다" (안전/소속의 욕구)
- **증빙 XP** — "나는 기록한다" (존중의 욕구)
- **기여 XP** — "나는 의미 있다" (자아실현의 욕구)

매슬로우 욕구 사다리를 게임 메커니즘으로 번역한 첫 번째 시도입니다.

---

## 핵심 시스템

**6대 메인 스탯** — 인간의 기본 성장 축
- 체력 · 집중력 · 실행력 · 지식력 · 관계력 · 전파력

**5대 클래스** — 문제를 푸는 방식
- 제작자 · 창작자 · 주도자 · 탐구자 · 조율자

**현실 퀘스트** — 행동을 게임으로
- Daily / Story / Custom / Project

**서사적 보상** — 숫자가 아닌 이야기
- "오늘 너의 시간은 흩어지지 않았다. 집중의 룬이 새겨졌다."

---

## 현재 상태

**Phase 1: MVP 개발 중** (2026-04-10 시작)

- ✅ 인프라 구축 완료 (도메인, 호스팅, GitHub, Email Routing)
- ✅ 문서화 완료 (사업계획서, PRD, 기술 명세)
- 🟡 Sprint 1 진행 중 (Next.js 초기화, 인증, D1 스키마)
- ⬜ 첫 베타 사용자 (4~6주 후 목표)

자세한 로드맵은 [docs/BUSINESS_PLAN.md](./docs/BUSINESS_PLAN.md) 참조.

---

## 기술 스택

**Frontend**
- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS
- React Query + Zustand

**Backend & Infra**
- Cloudflare Pages (Hosting)
- Cloudflare Workers / Route Handlers (API)
- Cloudflare D1 (SQLite Database)
- Cloudflare R2 (Image Storage)
- Drizzle ORM
- Lucia Auth

**기타**
- PWA (모바일 우선)
- Cloudflare Email Routing
- Cloudflare Web Analytics

---

## 문서

이 프로젝트의 모든 의사결정은 다음 문서에 정리되어 있습니다.

| 문서 | 내용 |
|---|---|
| [docs/BUSINESS_PLAN.md](./docs/BUSINESS_PLAN.md) | 전체 비전, 5단계 생태계, 수익 모델 |
| [docs/PRD.md](./docs/PRD.md) | 제품 철학, UX, 화면 구조, 차별화 원칙 |
| [docs/TECH_SPEC.md](./docs/TECH_SPEC.md) | 기술 스택, 데이터 모델, API, Sprint 계획 |

---

## 개발 시작하기

> ⚠️ 현재 Sprint 1 진행 중. 기능이 제한적입니다 (가입 · 로그인 · 빈 상태창).

### 필요 조건

- **Node.js 20+** (`node -v`로 확인)
- **npm**
- **Cloudflare 계정** + Wrangler 로그인 권한

### 최초 1회 셋업

```bash
# 1. 레포 clone
git clone https://github.com/scw999/lvup_app.git
cd lvup_app

# 2. 의존성 설치
npm install

# 3. 환경변수 파일 생성
#    Git Bash / macOS / Linux:
cp .env.example .env.local
#    Windows cmd:        copy .env.example .env.local
#    Windows PowerShell: Copy-Item .env.example .env.local
#    → 이후 .env.local을 열어 AUTH_SECRET 등의 값을 채운다.
#      (.env.example 주석에 OS별 AUTH_SECRET 생성 명령 안내)

# 4. Wrangler 로그인 (브라우저 창 열림)
npx wrangler login

# 5. D1 데이터베이스 생성 (한 번만)
npx wrangler d1 create lvup-db
#    → 출력된 database_id를 wrangler.toml의 [[d1_databases]] 블록에
#      붙여넣고 해당 블록의 주석(#)을 해제한다.

# 6. 로컬 D1에 마이그레이션 적용
npm run db:migrate:local
```

### 일상 개발

```bash
# Next 개발 서버 (Turbopack) — wrangler.toml의 D1 바인딩이 자동 주입됨
npm run dev
```

http://localhost:3000 접속.

### 주요 명령어

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (Turbopack, HMR, 로컬 D1 바인딩 주입) |
| `npm run build` | Next.js 프로덕션 빌드 |
| `npm run preview` | OpenNext로 빌드 후 Workers 환경을 로컬 시뮬레이션 |
| `npm run deploy` | Cloudflare Workers에 배포 |
| `npm run lint` | ESLint 체크 |
| `npm run db:generate` | Drizzle 스키마 변경 후 마이그레이션 SQL 생성 |
| `npm run db:migrate:local` | 로컬 D1에 마이그레이션 적용 |
| `npm run db:migrate:remote` | 프로덕션 D1에 마이그레이션 적용 |
| `npm run db:studio` | Drizzle Studio (GUI로 DB 조회) |
| `npm run cf-typegen` | wrangler types로 `cloudflare-env.d.ts` 자동 생성 |

### Sprint 4 이후 추가 셋업

```bash
# 인증 이미지 업로드용 R2 버킷 생성
npx wrangler r2 bucket create lvup-verifications
# → 이후 wrangler.toml의 [[r2_buckets]] 블록 주석 해제
```

자세한 개발 가이드는 [docs/TECH_SPEC.md](./docs/TECH_SPEC.md) 참조.

---

## 프로젝트 구조

```
lvup_app/
├── README.md                # 이 파일
├── docs/
│   ├── BUSINESS_PLAN.md     # 사업계획서
│   ├── PRD.md               # 제품 요구사항
│   └── TECH_SPEC.md         # 기술 명세
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React 컴포넌트
│   ├── lib/                 # 비즈니스 로직
│   │   ├── db/              # Drizzle 스키마, 쿼리
│   │   ├── auth/            # 인증 로직
│   │   ├── rewards/         # 보상 계산, 서사 메시지
│   │   └── quests/          # 퀘스트 로직
│   ├── hooks/
│   └── stores/              # Zustand 스토어
├── migrations/              # DB 마이그레이션
├── public/                  # 정적 파일, PWA manifest
├── wrangler.toml            # Cloudflare 설정
└── drizzle.config.ts
```

---

## 5대 차별화 원칙

LV UP의 모든 결정은 이 5원칙에 부합해야 합니다.

1. **도구가 아니라 세계** — 사용자는 시스템을 설정하지 않는다, 입장한다
2. **숫자가 아니라 이야기** — 모든 보상은 서사적 사건으로 표현된다
3. **스펙이 아니라 행동** — 학력/자격증/자산이 아닌 오늘의 행동만 평가한다
4. **비교가 아니라 자기 성장** — 랭킹은 없다, 어제의 나와만 비교한다
5. **성장에는 멈춤도 포함된다** — 더 빨리가 아니라 건강하게

---

## 우리가 절대 하지 않을 것

LV UP이 무엇이 아닌지 명확히 합니다.

- ❌ 자산/계좌/등기 인증
- ❌ 나이/생년월일 점수화
- ❌ 학력/자격증 자동 점수화
- ❌ 랭킹/리더보드/공개 비교
- ❌ 전문가 판정형 무거운 검수
- ❌ 컬트적 폐쇄성

---

## 첫 번째 사용자

LV UP의 첫 번째 사용자는 만든 사람입니다. 코드 한 줄 쓰기 전부터 본인이 LV UP의 첫 Founder Quest를 수행하고 있습니다.

> **[Founder Quest #001] LV UP에 인터넷 좌표를 부여하라**
> 완료일: 2026-04-10
> 보상: Founder 클래스 해금, "창세자(Genesis)" 칭호

만드는 사람이 먼저 사용자가 되는 것이 LV UP이 진짜 작동하는지 검증하는 가장 정직한 방법입니다.

---

## 라이선스

Proprietary. All rights reserved.

이 프로젝트의 코드, 문서, 디자인은 사전 서면 동의 없이 복제, 배포, 수정, 사용할 수 없습니다.

---

## 연락

- **Website**: [lvup.world](https://lvup.world)
- **Email**: genesis@lvup.world
- **GitHub**: [@scw999](https://github.com/scw999)

---

**LV UP — Level Up Your Reality** 🌍
