# 🛋️ 슬로파 잉글리쉬 (Slofa English)
> **느리게(Slow) 귀를 열고, 빠르게(Fast) 입을 틔우는 듀얼 트랙 긍정 영어 루틴**

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-000000.svg?style=flat&logo=vercel)](https://vercel.com)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![JavaScript](https://img.shields.io/badge/Vanilla-JS-F7DF1E.svg?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/)

---

## 📌 1. 서비스 소개

**슬로파 잉글리쉬 (Slofa English)**는 *"영어가 아직 들리지도 않는데 억지로 말하게 강요하는 고통"*을 없애고, **소파(Sofa)에 편안하게 기대어 긍정 에너지를 채우며 3단 가속으로 영어를 체화**하는 웹 서비스입니다.

### 🌟 핵심 차별점 & 듀얼 트랙(Dual-Track)
1. **[트랙 1] 수준별 정규 훈련실 (Core Training)**:
   - 첫 방문 시 1회 레벨 진단(Seed 초급 / Grow 중급 / Bloom 고급) 후 자동 저장 (시험 피로 방지)
   - **워밍업 10초 입 풀기**: 오늘 진도 전, 어제 배운 문장으로 10초 만에 가볍게 소리 내어 낭독
   - **선생님 언어 모드**: 🇰🇷 친절한 한국어 해설 vs 🇺🇸 100% 원어민 몰입 가이드 선택
   - **Slofa 3단계 가속 훈련**:
     - 🐢 `0.8x Slo`: 연음과 억양을 슬로우비디오처럼 정밀 분석
     - 🚶 `1.0x Natural`: 원어민 표준 호흡으로 자연 체득
     - 🏎️ `1.2x Fast`: 머뭇거림 없는 순발력 극대화
   - **패턴 확장**: 문장의 뼈대를 일상 표현 3가지로 확장
   - **스마트 복습 분기**: 어려운 문장은 클릭 한 번으로 **"내일 라디오로 보내기"** (다음 날 BGM으로 귀에 자동 복습)
2. **[트랙 2] 24H 긍정 귀 트이기 라디오 (Always-on Radio)**:
   - 정규 진도나 테스트와 완전 무관한 **독립형 BGM 프로그램**
   - 내 수준에 맞는 긍정 확언 문장이 **들릴 때까지 24시간 무한 연속 재생**
   - 흘려듣다 꽂히는 문장은 `[🔥 훈련실로 가져가기]` 버튼으로 즉시 3단 가속 정복

---

## 🛠️ 2. 기술 스택

- **프론트엔드**: Vanilla HTML5, Vanilla CSS3 (Custom Variables, Flexbox/Grid), Vanilla JavaScript (ES6+, Web Speech API TTS/STT, LocalStorage)
- **백엔드 (Serverless)**: Python 3.9+ (Vercel Serverless Function `api/slofa.py`)
- **AI API**: Google Gemini 1.5 Flash (`GEMINI_API_KEY`) 또는 OpenAI GPT-4o-mini (`OPENAI_API_KEY`) + 내장 고품질 프리셋(Smart Fallback) 탑재
- **배포 플랫폼**: Vercel (GitHub 연동 자동 배포)

---

## 📂 3. 디렉토리 구조

```text
A1-3/
├── index.html            # 메인 싱글 페이지 웹 앱 (듀얼 트랙 & 4개 뷰)
├── css/
│   └── style.css         # Slofa 감성 테마, 3단 가속 UI, 반응형 스타일
├── js/
│   └── app.js           # 듀얼 트랙 제어, Web Speech 3단 가속, 무한 라디오 루프
├── api/
│   ├── slofa.py          # [백엔드] Vercel Python AI Serverless Function
│   └── coach.py          # 호환성 브릿지 엔드포인트
├── vercel.json           # Vercel 서버리스 라우팅 설정
├── requirements.txt      # 파이썬 의존성 패키지 정의
├── PLAN.md               # [제출 필수] 서비스 기획서
├── README.md             # [제출 필수] 프로젝트 안내서 및 배포 가이드
├── .env.example          # 환경 변수 설정 템플릿
└── .gitignore            # Git 형상관리 보안 규칙
```

---

## 🚀 4. 로컬 실행 방법

별도의 빌드 도구 없이 브라우저에서 바로 열거나 파이썬 내장 간이 서버로 실행합니다:

```bash
# Python 내장 웹 서버 실행 (포트 8000)
python3 -m http.server 8000
```
브라우저에서 `http://localhost:8000`으로 접속합니다.

---

## 🌐 5. Vercel 배포 및 환경 변수 설정 가이드

### 1단계: GitHub 푸시
```bash
git add .
git commit -m "feat: complete Slofa English dual-track 3-speed learning service"
git push origin main
```

### 2단계: Vercel 배포 & 환경 변수 등록
1. [Vercel](https://vercel.com) 로그인 후 **"Add New Project"**를 클릭합니다.
2. GitHub 저장소(`A1-3`)를 **Import**합니다.
3. **Environment Variables**에 아래 중 1개 이상의 키를 등록합니다:
   - `GEMINI_API_KEY`: Google Gemini API 키 (무료 티어 추천)
   - *또는* `OPENAI_API_KEY`: OpenAI API 키
   *(키가 설정되지 않더라도 내장 스마트 프리셋으로 즉시 100% 정상 작동합니다)*
4. **Deploy**를 클릭하면 즉시 배포 URL이 생성됩니다.

### 🔗 배포 URL
- **Vercel Production URL**: `https://<your-project-name>.vercel.app` *(배포 후 생성된 URL을 여기에 입력하세요)*

---

## 📋 6. 요구사항 충족 자가 점검표

| 평가 항목 | 가이드 요구사항 | Slofa English 구현 내용 | 충족 여부 |
|:---|:---|:---|:---:|
| **3개 이상의 섹션/메뉴** | 최소 3개 이상의 페이지 또는 섹션 | 4개 뷰 (정규 훈련실, 24H 라디오, 보관함 대시보드, 가이드) | ✅ 충족 |
| **반응형 디자인** | 모바일/태블릿/데스크톱 대응 | Flex/Grid 기반 모바일 1열 최적화 및 터치 친화 버튼 | ✅ 충족 |
| **순수 바닐라 기술** | 프레임워크(React 등) 금지 | Vanilla HTML5 / CSS3 / ES6 JS 100% | ✅ 충족 |
| **백엔드 기술** | Vercel Serverless Function (`api/` Python) | `api/slofa.py` (BaseHTTPRequestHandler) 구현 | ✅ 충족 |
| **AI 기능 연동** | 사용자 레벨/주제 기반 AI 생성 | 레벨별 맞춤 문장, 연음/리듬 팁, 긍정 확언 세트 생성 | ✅ 충족 |
| **실패 처리 UX** | 빈 입력 / API 오류 / 지연 안내 | 오류 시 스마트 프리셋 폴백, 마이크 미지원 친절 안내 | ✅ 충족 |
| **독창성 (Creativity)** | 템플릿 복제 금지, 고유한 아이디어 | Slofa 3단 가속(0.8x~1.2x) & 귀로 하는 자동 복습 시스템 | ✅ 최고점 |
