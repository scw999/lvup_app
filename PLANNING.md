# LV UP 웹앱 기획서 v1

## 문서 정보
- **프로젝트**: LV UP — 현실을 게임처럼 재설계하는 인류 성장 생태계
- **도메인**: lvup.world
- **GitHub**: github.com/scw999/lvup_app
- **인프라**: Cloudflare 풀스택 (Pages + Workers + D1 + R2)
- **형태**: PWA (Progressive Web App) — 모바일 우선, 앱스토어 없이 홈 화면 추가 가능
- **작성일**: 2026-04-10

---

## 1. 제품 한 줄 정의

**LV UP은 당신을 자기 인생의 CEO로 만든다.**
거대한 목표를 작은 퀘스트로 쪼개서 하루에 하나씩 실행하고,
그 즉시 성장의 도파민을 느끼며,
매출과 선한 영향력을 통해 자아실현까지 도달하는 현실 성장 RPG.

---

## 2. 경쟁 분석: LiFE RPG (heyalbert)

### 2.1 LiFE RPG가 잘하는 것 (훔칠 것)

| 장점 | 구체적 내용 | LV UP 적용 방안 |
|------|------------|----------------|
| SEO 콘텐츠 전략 | 블로그 포스트 15개+ 로 "gamify your life", "notion RPG" 등 검색 장악 | "현실 RPG", "인생 게임화", "자기계발 게임" 등 한국어 SEO 선점 |
| 명확한 단일 CTA | 모든 페이지가 "Grab it!" 하나로 수렴 | 초기엔 "베타 신청" 또는 "상태창 열기" 하나에 집중 |
| 창작자 퍼소나 | Albert 본인이 브랜드의 얼굴, Notion Ambassador 권위 활용 | 창완(Genesis)이 LV UP의 첫 캐릭터이자 창세자로 등장 |
| 시각적 일관성 | 다크 모드, Solo Leveling 미학, 일관된 일러스트 | LV UP만의 오리지널 비주얼 아이덴티티 확립 |
| 생태계 확장 | Wiki, Newsletter, Affiliate, YouTube까지 운영 | 소설, 앱, 커뮤니티, 아카데미 순으로 단계적 확장 |
| 게이미피케이션 학술 기반 | Octalysis Framework 등 이론적 근거 제시 | 매슬로우 욕구 계층 + 도파민 루프를 LV UP 고유 프레임워크로 정리 |

### 2.2 LiFE RPG의 한계 (피할 것)

| 한계 | 왜 문제인가 | LV UP의 대안 |
|------|-----------|-------------|
| 노션 종속 | 노션 안에서만 작동, 모바일 경험 열악, 확장 불가 | 독립 웹앱(PWA), lvup.world에서 직접 서비스 |
| 혼자 하는 시스템 | 길드·동료·멘토 없음, 3주 안에 동력 소멸 | 첫 가입부터 길드 자동 매칭, 사회적 시스템 내장 |
| 차용 IP (Solo Leveling) | 법적 리스크, 자체 IP 불가, 영원히 "따라한 것" | 오리지널 세계관, 소설이 IP의 원본 |
| 도구 포지셔닝 | "당신이 직접 설정하세요" — 사용자가 노동해야 함 | 이미 살아있는 세계에 입장, 시스템이 자동 작동 |
| 추상적 재미 | "재미있다"고 주장만 하고 실제로는 숫자 증가뿐 | 서사적 보상, 랜덤 이벤트, 사회적 인정, 시즌 변화 |
| 스프레드시트 미학 | 결국 표와 숫자로 구성, 게임이 아니라 관리 도구 | 어둡고 몰입감 있는 RPG UI, 세계관이 살아있는 화면 |

### 2.3 핵심 통찰

> LiFE RPG는 "인생을 게임처럼 살고 싶다"는 욕망이 진짜임을 시장에서 검증했다.
> 동시에 노션 템플릿이라는 형태의 천장을 보여주었다.
> LV UP은 그 천장 위에 들어갈 자리에 있다.
> 시장은 이 천장을 깰 무언가를 기다리고 있다.

---

## 3. LV UP 5대 차별화 원칙

### 원칙 1: 도구가 아니라 세계

사용자는 도구를 설정하는 것이 아니라, 이미 살아있는 세계에 입장한다.
클래스 하나만 고르면 첫 퀘스트가 자동으로 나오고, 진행하면 다음이 풀리고,
어느 순간 길드에 초대되고, 시즌 이벤트가 시작된다.
사용자는 시스템을 만들 필요 없이 그냥 들어와서 살면 된다.

### 원칙 2: 숫자가 아니라 이야기

"+5 STR" 대신 "길드의 주술사가 너에게 새로운 룬을 새겨주었다".
모든 인증과 보상은 단순 숫자 증가가 아니라 작은 서사적 사건으로 표현된다.
LV UP은 소설 작가가 세계관을 직접 쓰기 때문에 이것이 가능하다.

### 원칙 3: 혼자가 아니라 함께

첫 가입 순간부터 작은 길드에 자동 매칭.
같은 시즌을 시작한 다른 사람들의 흔적이 보인다.
누군가의 성취가 내 화면에 흘러온다.
인간을 진짜로 움직이는 건 사회적 압력과 소속감과 인정이다.

### 원칙 4: 추상이 아니라 구체

"재미있다"고 말하지 않고 실제로 재미있게 만든다.
- 매 행동에 작은 서사가 붙는다
- 예측 못한 사건이 가끔 일어난다 (랜덤 이벤트, 미스터리 보물상자)
- 다른 사람과의 작은 상호작용이 있다
- 시즌별 주제와 변화가 있다

### 원칙 5: 성장에는 멈춤도 포함된다

"더 빨리 레벨업"이 아니라 "건강하게 레벨업".
강제 휴식 퀘스트, "오늘은 충분히 했다" 메시지, 만족 인증.
도파민 루프가 번아웃이 아니라 진짜 자아실현으로 향하게 설계한다.

---

## 4. MVP 기능 명세

### 4.1 MVP 범위 (Phase 1 — 4주 목표)

**핵심 검증 질문**: "사람이 lvup.world에 들어와서 실제 퀘스트를 수행하고, 다음 날 다시 돌아오는가?"

#### 필수 기능 (Must Have)

1. **온보딩 / 입장**
   - 이메일 가입 + 구글 소셜로그인
   - 클래스 선택 (Creator / Builder / Founder)
   - 닉네임 입력
   - 첫 목표 선택 (습관 만들기 / 프로젝트 시작 / 수익 만들기 / 팀 찾기)
   - 상태창 자동 생성 (10초 이내 완료)

2. **상태창 (메인 화면)**
   - 클래스 아이콘 + 닉네임
   - 현재 레벨 + XP 바
   - 6대 스탯 시각화 (Knowledge, Skill, Execution, Social, Integrity, Influence)
   - 오늘의 메인 퀘스트 카드 (가장 크게)
   - 연속 수행 일수
   - 다음 레벨까지 남은 XP

3. **퀘스트 시스템**
   - 퀘스트 목록 (Daily / Story / Custom)
   - 퀘스트 추가 (사용자가 직접 만들 수 있음)
   - 퀘스트 상세 (제목, 설명, 예상 시간, 보상)
   - 퀘스트 시작 / 완료 체크
   - 완료 시 XP + 스탯 반영 (즉시)

4. **인증 시스템**
   - 텍스트 입력
   - 이미지 업로드 (R2 저장)
   - 링크 제출
   - 인증 제출 → 즉시 보상 화면 (딜레이 없이)

5. **보상 / 피드백**
   - 퀘스트 완료 시 즉각적 보상 애니메이션
   - XP 증가 + 레벨업 연출
   - 스탯 변화 시각화
   - 서사적 보상 메시지 (단순 "+10 XP"가 아님)

6. **성장 로그**
   - 일별/주별 활동 요약
   - 완료한 퀘스트 히스토리
   - 인증 갤러리 (타임라인 형태)

#### 후순위 기능 (Phase 2 이후)

- 길드 시스템 (자동 매칭, 공동 퀘스트)
- 인벤토리 / 아이템
- 소설 연동 스토리 허브
- Verdict 심사 시스템
- 시즌 이벤트
- 리더보드 / 랭킹
- 알림 (푸시)
- 프리미엄 구독

### 4.2 MVP 성공 기준 (KPI)

| 지표 | 목표 |
|------|------|
| 가입 → 첫 퀘스트 완료율 | 60% 이상 |
| D1 재방문율 (다음 날 다시 오는 비율) | 40% 이상 |
| D7 재방문율 | 25% 이상 |
| 주간 퀘스트 완료 수 (1인 평균) | 5개 이상 |
| 인증 업로드 비율 (퀘스트 대비) | 30% 이상 |

---

## 5. 기술 스택

### 5.1 확정 스택

| 영역 | 기술 | 이유 |
|------|------|------|
| 도메인 + DNS | Cloudflare Registrar | lvup.world 이미 등록, 자동 통합 |
| 프론트엔드 | Next.js 14+ (App Router) | SSR/SSG, React 생태계, Cloudflare Pages 호환 |
| 호스팅 | Cloudflare Pages | GitHub 자동 배포, 글로벌 CDN, 무료 |
| API | Cloudflare Workers | 서버리스, 빠름, D1과 직접 연동 |
| DB | Cloudflare D1 (SQLite) | 같은 인프라, 무료 tier 충분, 속도 좋음 |
| 파일 저장 | Cloudflare R2 | 인증 사진 저장, egress 무료 |
| 인증 | Better Auth 또는 Lucia | Workers + D1 호환, 소셜로그인 지원 |
| CSS | Tailwind CSS | 빠른 개발, 유틸리티 우선 |
| 이메일 | Cloudflare Email Routing | genesis@lvup.world 이미 설정됨 |
| 분석 | Cloudflare Web Analytics | 무료, 쿠키 없음 |
| PWA | next-pwa 또는 수동 설정 | 홈 화면 추가, 오프라인 기본 지원 |

### 5.2 GitHub 레포 구조 (권장)

```
lvup_app/
├── README.md
├── package.json
├── next.config.js
├── wrangler.toml          # Cloudflare Workers/D1 설정
├── drizzle.config.ts      # D1 ORM 설정
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # 전체 레이아웃 (다크 테마)
│   │   ├── page.tsx       # 랜딩 / Coming Soon
│   │   ├── (auth)/        # 로그인/가입
│   │   ├── (app)/         # 인증 후 메인 앱
│   │   │   ├── status/    # 상태창
│   │   │   ├── quests/    # 퀘스트
│   │   │   ├── log/       # 성장 로그
│   │   │   └── settings/  # 설정
│   │   └── api/           # API 라우트 (Workers)
│   ├── components/        # 공유 컴포넌트
│   ├── lib/               # 유틸리티, DB 스키마
│   └── styles/            # 글로벌 스타일
├── public/
│   ├── manifest.json      # PWA 매니페스트
│   └── icons/             # 앱 아이콘
└── migrations/            # D1 마이그레이션
```

---

## 6. DB 스키마 (D1 — SQLite)

```sql
-- 사용자
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('creator', 'builder', 'founder')),
  goal TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next INTEGER DEFAULT 100,
  streak_days INTEGER DEFAULT 0,
  last_active_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 6대 스탯
CREATE TABLE user_stats (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  knowledge INTEGER DEFAULT 10,
  skill INTEGER DEFAULT 10,
  execution INTEGER DEFAULT 10,
  social INTEGER DEFAULT 10,
  integrity INTEGER DEFAULT 10,
  influence INTEGER DEFAULT 10,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 퀘스트
CREATE TABLE quests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('daily', 'story', 'custom')),
  difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'hard', 'epic')),
  xp_reward INTEGER DEFAULT 10,
  stat_type TEXT CHECK (stat_type IN ('knowledge', 'skill', 'execution', 'social', 'integrity', 'influence')),
  stat_reward INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'expired')),
  due_date TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 인증
CREATE TABLE verifications (
  id TEXT PRIMARY KEY,
  quest_id TEXT NOT NULL REFERENCES quests(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'link')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 성장 로그 (일별 스냅샷)
CREATE TABLE growth_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  quests_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  level INTEGER,
  narrative TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, date)
);

-- 레벨업 이벤트
CREATE TABLE level_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  from_level INTEGER NOT NULL,
  to_level INTEGER NOT NULL,
  narrative TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 7. 화면 구조 & UX 흐름

### 7.1 전체 네비게이션 (하단 탭 3개 — 최소화)

```
[ 상태창 ]  [ 퀘스트 ]  [ 로그 ]
```

Phase 2에서 추가: [ 길드 ] [ 인벤토리 ]

### 7.2 화면별 상세

#### 화면 0: 랜딩 (lvup.world 첫 진입)

- 어두운 배경, 세계관 분위기
- "LV UP" 로고 + 한 줄 카피
- "상태창 열기" CTA 버튼 하나
- 하단에 짧은 세계관 소개 (3줄 이내)
- 디자인 톤: 다크, 미니멀, 약간의 빛/글로우 효과, RPG 판타지가 아닌 "현실+디지털" 느낌

#### 화면 1: 온보딩 (가입 → 상태창 생성)

**Step 1**: 가입 (이메일 또는 구글) — 한 화면
**Step 2**: 클래스 선택 — 3개 카드 (Creator / Builder / Founder)
  - 각 카드에 한 줄 설명 + 아이콘
  - 탭하면 선택, 즉시 다음으로
**Step 3**: 닉네임 + 첫 목표 선택 — 한 화면
  - 목표 4개 중 택 1 (습관 / 프로젝트 / 수익 / 팀)
**Step 4**: 상태창 생성 연출
  - 짧은 로딩 애니메이션 (세계관 분위기)
  - "당신의 상태창이 열렸습니다"
  - 첫 퀘스트 자동 제시

**전체 소요 시간: 60초 이내**

#### 화면 2: 상태창 (메인 홈)

```
┌─────────────────────────┐
│  [클래스 아이콘]         │
│  닉네임                  │
│  Lv. 1  ████░░░░ 20/100 │
│  🔥 연속 3일             │
├─────────────────────────┤
│  ┌──────┐ ┌──────┐      │
│  │KNW 10│ │SKL 10│      │
│  └──────┘ └──────┘      │
│  ┌──────┐ ┌──────┐      │
│  │EXE 10│ │SOC 10│      │
│  └──────┘ └──────┘      │
│  ┌──────┐ ┌──────┐      │
│  │INT 10│ │INF 10│      │
│  └──────┘ └──────┘      │
├─────────────────────────┤
│  ╔═══════════════════╗  │
│  ║ 오늘의 메인 퀘스트 ║  │
│  ║ "첫 목표를 적어라" ║  │
│  ║ ⏱ 20분 | +20 XP   ║  │
│  ║  [ 시작하기 ]      ║  │
│  ╚═══════════════════╝  │
├─────────────────────────┤
│  최근 성장: +15 XP 오늘  │
│  다음 해금: Lv.2 길드입장│
└─────────────────────────┘
```

#### 화면 3: 퀘스트 목록

- 상단 탭: Daily | Story | Custom
- 각 퀘스트 카드: 제목 + 난이도 뱃지 + 예상 시간 + XP 보상
- 우측 하단 FAB: + (퀘스트 추가)
- 완료된 퀘스트는 체크 표시 + 페이드

#### 화면 4: 퀘스트 상세 & 인증

```
┌─────────────────────────┐
│  [Daily Quest]           │
│  "20분 집중해서 작업하라"│
│                          │
│  세계관 문구:             │
│  "집중의 룬을 새기는 자만│
│   이 다음 문을 열 수     │
│   있다."                 │
│                          │
│  완료 조건:              │
│  · 20분 집중 작업        │
│  · 작업 결과 한 줄 기록  │
│                          │
│  보상: +15 XP, EXE +1   │
│                          │
│  ┌─────────────────┐    │
│  │   인증하기        │    │
│  └─────────────────┘    │
│                          │
│  인증 방식:              │
│  [📝 텍스트] [📷 사진]  │
│  [🔗 링크]               │
└─────────────────────────┘
```

#### 화면 5: 보상 연출 (인증 완료 후)

- 전체 화면 오버레이
- 레벨업 시: 특별 연출 + 서사적 메시지
- 일반 완료: 깔끔한 보상 요약
- 예시 메시지: "오늘의 집중이 너의 실행력을 강화했다. EXE +1."
- "다음 퀘스트 보기" 또는 "상태창으로" 선택

#### 화면 6: 성장 로그

- 캘린더 히트맵 (GitHub 잔디처럼)
- 일별 클릭 시: 그날 완료한 퀘스트 + 인증 내용
- 주간 요약 카드: 이번 주 XP, 완료 퀘스트 수, 성장 스탯
- 인증 갤러리 (사진 타임라인)

---

## 8. 디자인 가이드

### 8.1 톤 & 무드

- **"현실 + 디지털 RPG"** — 중세 판타지가 아님. 네온 사이버펑크도 아님.
- 어두운 배경 (#0a0a0a ~ #1a1a1a)에 차가운 빛 (화이트, 블루-퍼플 미묘한 글로우)
- "심플하지만 세계관이 느껴지는" 미학
- 참고 톤: 영화 <레디 플레이어 원>의 현실 파트 + <매트릭스>의 UI 느낌 + Apple의 미니멀 + 한국 웹소설 상태창 UI

### 8.2 컬러 팔레트

```
--bg-primary: #0a0a0a        /* 메인 배경 */
--bg-secondary: #141414      /* 카드 배경 */
--bg-tertiary: #1e1e1e       /* 입력 필드, 서브 영역 */
--text-primary: #ffffff      /* 주 텍스트 */
--text-secondary: #a0a0a0    /* 보조 텍스트 */
--text-muted: #555555        /* 비활성 텍스트 */
--accent-primary: #6366f1    /* 메인 액센트 (인디고) */
--accent-glow: #818cf8       /* 글로우 효과 */
--accent-success: #22c55e    /* 완료, 성공 */
--accent-warning: #f59e0b    /* 주의, 진행 중 */
--accent-xp: #a78bfa         /* XP 관련 */
--border: #2a2a2a            /* 경계선 */
```

### 8.3 타이포그래피

- 영문: Geist (Vercel 폰트) 또는 JetBrains Mono (코드/수치)
- 한글: Pretendard 또는 SUIT
- 수치/레벨: JetBrains Mono (모노스페이스, 게임 느낌)

### 8.4 핵심 UI 원칙

1. **모든 화면은 행동을 유도해야 한다** — 구경하는 화면은 없다
2. **보상은 즉각적이어야 한다** — 인증 후 0.5초 안에 결과 표시
3. **서사적 메시지가 숫자보다 먼저 온다** — "+10 XP" 전에 "집중의 룬이 새겨졌다"
4. **세계관 톤은 진지하되 무겁지 않게** — 유치한 RPG 말투 금지, 담백하고 힘 있는 어조
5. **빈 상태(empty state)도 세계관이 있다** — 퀘스트가 없을 때 "오늘의 모험은 아직 시작되지 않았다"

---

## 9. 서사적 보상 시스템 (LiFE RPG와의 핵심 차별점)

### 9.1 보상 메시지 예시

퀘스트 완료 시 단순 숫자가 아닌, 세계관이 살아있는 메시지를 표시한다.

```
// 운동 퀘스트 완료
일반: "+15 XP, Execution +1"
LV UP: "오늘 너는 한계를 한 발짝 넘었다. 실행력이 강화되었다. EXE +1"

// 독서 퀘스트 완료
일반: "+10 XP, Knowledge +1"
LV UP: "새로운 지식이 너의 시야를 넓혔다. 아직 읽지 않은 책장이 빛나고 있다. KNW +1"

// 프로젝트 작업 완료
일반: "+20 XP, Skill +1"
LV UP: "손끝에서 무언가가 만들어졌다. 빌더의 본능이 깨어나고 있다. SKL +1"

// 사람 만남 / 네트워킹
일반: "+10 XP, Social +1"
LV UP: "새로운 연결이 생겼다. 세계는 혼자 넓히는 것이 아니다. SOC +1"

// 레벨업
일반: "Level Up! Lv.1 → Lv.2"
LV UP: "── LEVEL UP ──
        당신은 더 이상 어제의 당신이 아니다.
        Lv.2 — 자각한 자
        새로운 퀘스트가 해금되었습니다."
```

### 9.2 레벨별 칭호 (초기 10레벨)

| 레벨 | 칭호 | 해금 요소 |
|------|------|----------|
| 1 | 입장한 자 | 기본 퀘스트 |
| 2 | 자각한 자 | 커스텀 퀘스트 생성 |
| 3 | 첫 걸음을 뗀 자 | 성장 로그 주간 요약 |
| 4 | 흔들리지 않는 자 | 연속 7일 배지 |
| 5 | 길을 찾은 자 | 길드 입장 (Phase 2) |
| 7 | 불꽃을 품은 자 | 스토리 퀘스트 해금 |
| 10 | 각성한 자 | 멘토 시스템 (Phase 2) |

---

## 10. XP & 레벨 산정 규칙 v1

### 10.1 퀘스트별 XP

| 난이도 | XP | 예시 |
|--------|-----|------|
| Easy | 5~10 | 물 1L 마시기, 스트레칭 |
| Normal | 10~20 | 20분 집중, 책 10분, 운동 30분 |
| Hard | 20~40 | 프로젝트 1시간 작업, 블로그 포스트 작성 |
| Epic | 40~100 | 제품 출시, 발표, 중요한 미팅 완수 |

### 10.2 레벨업 곡선

```
Lv.1 → 2:  100 XP
Lv.2 → 3:  150 XP
Lv.3 → 4:  225 XP
Lv.4 → 5:  340 XP
Lv.5 → 6:  500 XP
...
공식: required_xp = floor(100 * 1.5^(level-1))
```

초반에는 빠르게 올라가서 성취감을 주고,
후반에는 느려지면서 "진짜 노력"이 필요해지는 곡선.

### 10.3 스탯 반영

- 각 퀘스트에 주요 스탯 1개 지정
- 완료 시 해당 스탯 +1 (Easy), +2 (Normal), +3 (Hard), +5 (Epic)
- 스탯은 단순 합산 (복잡한 가중치는 Phase 2에서)

### 10.4 연속 수행 보너스

- 2일 연속: +10% XP 보너스
- 7일 연속: +25% XP 보너스 + "불굴의 의지" 배지
- 30일 연속: +50% XP 보너스 + 특별 칭호
- 연속이 끊겨도 레벨/스탯은 떨어지지 않음 (처벌 아닌 보상 설계)

---

## 11. Claude Code / Codex 개발 프롬프트

아래 프롬프트는 실제 코드 생성 시 사용할 수 있다.

### 11.1 초기 프로젝트 설정 프롬프트

```
LV UP 웹앱을 만들어줘. 이 프로젝트는 현실을 게임처럼 재설계하는 성장 RPG 플랫폼이야.

## 기술 스택
- Next.js 14+ (App Router, TypeScript)
- Cloudflare Pages로 배포
- Cloudflare Workers (API)
- Cloudflare D1 (SQLite DB)
- Cloudflare R2 (이미지 저장)
- Tailwind CSS
- Better Auth 또는 Lucia (인증)
- Drizzle ORM (D1 연동)
- PWA 지원

## 프로젝트 구조
GitHub 레포: scw999/lvup_app
배포 도메인: lvup.world

## 디자인
- 다크 테마 기본 (배경 #0a0a0a)
- 모바일 우선 (375px 기준)
- 한글 폰트: Pretendard, 영문: Geist
- 수치 표시: JetBrains Mono
- 액센트 컬러: 인디고 (#6366f1)
- RPG 세계관 느낌이지만 미니멀하고 현대적인 UI

## 초기 설정만 해줘
1. Next.js 프로젝트 초기화
2. Tailwind CSS 설정
3. Cloudflare 바인딩 설정 (wrangler.toml)
4. D1 데이터베이스 스키마 (위 기획서의 SQL 참조)
5. Drizzle ORM 설정
6. 기본 레이아웃 (다크 테마, 하단 탭 3개)
7. PWA manifest.json
8. 랜딩 페이지 (현재 Coming Soon을 개선)
```

### 11.2 온보딩 플로우 프롬프트

```
LV UP 앱의 온보딩 플로우를 만들어줘.

## 흐름
1. 랜딩 → "상태창 열기" 버튼 → 가입 페이지
2. 가입: 이메일+비밀번호 또는 구글 소셜로그인
3. 클래스 선택: 3개 카드 (Creator, Builder, Founder)
   - Creator: "콘텐츠와 표현으로 세계를 바꾸는 자" — 보라색
   - Builder: "기술과 제작으로 세계를 짓는 자" — 파란색
   - Founder: "비전과 실행으로 세계를 이끄는 자" — 초록색
4. 닉네임 입력 + 첫 목표 선택 (4개 중 택 1)
5. 상태창 생성 연출 (로딩 애니메이션 + "당신의 상태창이 열렸습니다")
6. 메인 홈(상태창)으로 전환, 첫 퀘스트 자동 제시

## 디자인 원칙
- 전체 과정 60초 이내
- 한 화면에 하나의 선택만
- 뒤로가기 가능
- 진행 표시 바 (Step 1/4 같은)
- 클래스 선택은 카드 탭하면 즉시 선택 (확인 버튼 불필요)
- 세계관 분위기 유지 (다크 배경, 미묘한 글로우)
- 절대로 밝은 배경이나 일반 SaaS 스타일 안 씀

## 기술
- Better Auth 또는 Lucia로 인증
- D1에 사용자 정보 저장
- 클래스 선택 시 user_stats 초기값 자동 생성
```

### 11.3 상태창 + 퀘스트 시스템 프롬프트

```
LV UP 앱의 핵심 기능을 만들어줘: 상태창(메인 홈)과 퀘스트 시스템.

## 상태창 (메인 홈)
- 상단: 클래스 아이콘 + 닉네임 + 레벨 + XP 바
- 연속 수행 일수 (🔥 아이콘)
- 6대 스탯 그리드 (2x3):
  Knowledge, Skill, Execution, Social, Integrity, Influence
  각 스탯은 숫자 + 작은 바 차트
- 오늘의 메인 퀘스트 카드 (가장 크게, 글로우 효과)
  - 퀘스트명, 예상 시간, XP 보상, "시작하기" 버튼
- 하단: 최근 성장 요약 한 줄 + 다음 해금 안내

## 퀘스트 시스템
- 퀘스트 목록: Daily / Story / Custom 탭
- 각 카드: 제목, 난이도 뱃지(easy/normal/hard/epic), 시간, XP
- FAB로 새 퀘스트 추가 (Custom):
  - 제목 (필수)
  - 설명 (선택)
  - 난이도 선택
  - 관련 스탯 선택
  - 기한 (선택)
- 퀘스트 완료 체크 → 인증 화면으로
- 인증: 텍스트 / 이미지(R2 업로드) / 링크 중 택 1
- 인증 제출 → 즉시 보상 연출:
  - XP 올라가는 애니메이션
  - 스탯 변화
  - 서사적 메시지 ("+10 XP"가 아니라 "집중의 룬이 새겨졌다. EXE +1")
  - 레벨업 시 전체 화면 특별 연출

## 보상 메시지 시스템
각 스탯별로 3~5개의 서사적 메시지 풀을 만들고, 랜덤으로 표시:
- Knowledge: "새로운 지식이 시야를 넓혔다", "아직 읽지 않은 책장이 빛나고 있다"
- Skill: "손끝에서 무언가가 만들어졌다", "빌더의 본능이 깨어나고 있다"
- Execution: "한계를 한 발짝 넘었다", "실행한 자만이 다음 문을 연다"
- Social: "새로운 연결이 생겼다", "세계는 혼자 넓히는 것이 아니다"
- Integrity: "신뢰의 돌을 하나 더 쌓았다", "바른 길은 느리지만 무너지지 않는다"
- Influence: "네 목소리가 한 사람에게 닿았다", "영향력은 행동에서 시작된다"

## XP/레벨 로직
- XP 공식: required_xp = floor(100 * 1.5^(level-1))
- 연속 보너스: 2일 +10%, 7일 +25%, 30일 +50%
- 레벨업 시 칭호 변경 (1: 입장한 자, 2: 자각한 자, 3: 첫 걸음을 뗀 자...)

## 디자인 (반드시 준수)
- 다크 배경 (#0a0a0a)
- 카드는 #141414 배경 + #2a2a2a 보더
- 메인 퀘스트 카드에 인디고 글로우 효과
- 보상 연출 시 짧은 파티클/글로우 애니메이션
- 모바일 우선 (375px), 데스크탑 반응형
```

---

## 12. 실행 로드맵 (Phase 1: 4주)

| 주 | 목표 | 핵심 산출물 |
|----|------|-----------|
| Week 1 | 프로젝트 기반 + 온보딩 | Next.js 초기화, D1 스키마, 인증, 온보딩 플로우, 랜딩 개선 |
| Week 2 | 상태창 + 퀘스트 | 상태창 메인 홈, 퀘스트 CRUD, 인증 업로드, XP/레벨 로직 |
| Week 3 | 보상 + 성장 로그 | 서사적 보상 시스템, 레벨업 연출, 성장 로그, 캘린더 히트맵 |
| Week 4 | QA + 베타 | 버그 수정, 성능 최적화, PWA 설정, 첫 베타 사용자 3~5명 초대 |

---

## 부록: 오늘의 마일스톤 (2026-04-10)

- [x] lvup.world 도메인 구매 (Cloudflare Registrar)
- [x] genesis@lvup.world 이메일 설정 (Email Routing)
- [x] GitHub 레포 생성 (scw999/lvup_app)
- [x] Cloudflare Pages 연동 + 자동 배포
- [x] lvup.world에 첫 페이지 라이브
- [x] 경쟁자 LiFE RPG 분석 완료
- [ ] 이 기획서를 기반으로 MVP 개발 시작 (다음 단계)
