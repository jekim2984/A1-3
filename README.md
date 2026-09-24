# ✍️ LinguaCraft (링구아크래프트)
> **AI 기반 맞춤형 영작 첨삭 & 원어민 뉘앙스 코칭 웹 서비스**

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-000000.svg?style=flat&logo=vercel)](https://vercel.com)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![JavaScript](https://img.shields.io/badge/Vanilla-JS-F7DF1E.svg?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/)

---

## 📌 1. 서비스 소개

**LinguaCraft**는 한국인 학습자가 영작할 때 자주 겪는 "어색한 직역투"를 해결해주는 반응형 AI 영어 작문 코칭 서비스입니다.

단순 오탈자 수정 수준을 넘어, **목표 상황(일상 캐주얼, 비즈니스 이메일, 생생한 원어민 구어체, 아카데믹)**에 맞춰 자연스러운 영어 문장으로 다듬어주며, 상세한 문법/뉘앙스 해설과 원어민이 실제 즐겨 쓰는 대체 표현을 함께 제시합니다.

### 🌟 핵심 기능
1. **AI 영작 첨삭 & 뉘앙스 코칭**:
   - 4가지 톤(일상/비즈니스/원어민구어체/아카데믹) 맞춤형 첨삭
   - 친절한 한국어 해설 및 원어민 대체 표현 3종 제공
   - 원어민 오디오 발음 재생 (Web Speech API) 및 클립보드 복사
2. **오늘의 관용구 & 미니 퀴즈**:
   - 매일 새로운 핵심 영어 관용구 학습 및 즉석 3지선다 퀴즈
3. **나만의 단어장 & 복습 아카이브 (LocalStorage)**:
   - 교정받은 표현을 브라우저에 영구 저장 및 검색, 발음 듣기
4. **완벽한 반응형 & 다크 모드**:
   - 모바일, 태블릿, 데스크톱 최적화 레이아웃 및 다크/라이트 모드 지원
5. **견고한 UX 실패 처리**:
   - 빈 입력 방지 및 실시간 유효성 검사, 로딩 스피너 및 8초 이상 지연 안내, API 키 미등록 시 데모 결과 미리보기 지원

---

## 🛠️ 2. 기술 스택

- **프론트엔드**: Vanilla HTML5, Vanilla CSS3 (Custom Variables, Flexbox/Grid), Vanilla JavaScript (ES6+)
- **백엔드 (Serverless)**: Python 3.9+ (Vercel Serverless Function `api/coach.py`)
- **AI API**: Google Gemini 1.5 Flash API (`GEMINI_API_KEY`) 또는 OpenAI GPT-4o-mini (`OPENAI_API_KEY`)
- **배포 플랫폼**: Vercel (GitHub 연동 자동 배포)

---

## 📂 3. 디렉토리 구조

```text
A1-3/
├── index.html            # 메인 싱글 페이지 웹 애플리케이션 (4개 섹션)
├── css/
│   └── style.css         # 다크모드 및 반응형 모던 스타일시트
├── js/
│   └── app.js           # 프론트엔드 인터랙션, API 호출, TTS, LocalStorage
├── api/
│   └── coach.py          # Vercel Python Serverless Function (AI 엔드포인트)
├── vercel.json           # Vercel 라우팅 및 빌드 설정
├── requirements.txt      # 파이썬 의존성 패키지 정의
├── PLAN.md               # [제출 필수] 서비스 기획서
├── README.md             # [제출 필수] 프로젝트 상세 안내서
├── guide.md              # 미션 가이드 문서
├── .env.example          # 환경 변수 설정 예시
└── .gitignore            # Git 형상관리 예외 규칙
```

---

## 🚀 4. 로컬 실행 방법

### 프론트엔드 로컬 테스트
별도의 빌드 도구 없이 브라우저에서 바로 열거나 간이 웹 서버를 실행합니다:

```bash
# Python 내장 웹 서버 실행 (포트 8000)
python3 -m http.server 8000
```
브라우저에서 `http://localhost:8000`으로 접속합니다.

### Vercel CLI를 통한 백엔드 서버리스 로컬 실행
```bash
# Vercel CLI 설치
npm i -g vercel

# 로컬 개발 서버 실행 (Serverless Function 포함)
vercel dev
```

---

## 🌐 5. Vercel 배포 및 환경 변수 설정 가이드

### 1단계: GitHub 저장소 푸시
```bash
git add .
git commit -m "feat: complete LinguaCraft AI writing coach service"
git push origin main
```

### 2단계: Vercel 배포
1. [Vercel](https://vercel.com)에 로그인 후 **"Add New Project"**를 클릭합니다.
2. GitHub의 `A1-3` 저장소를 임포트(Import)합니다.
3. **Environment Variables** 설정 탭에서 아래 중 1개 이상의 API 키를 추가합니다:
   - `GEMINI_API_KEY` : Google AI Studio에서 발급받은 Gemini API 키 (권장)
   - *또는* `OPENAI_API_KEY` : OpenAI API 키
4. **Deploy** 버튼을 클릭하면 수 분 내에 전 세계에 접속 가능한 URL이 생성됩니다.

> ⚠️ **보안 주의**: API 키는 코드나 GitHub 커밋에 절대 올리지 마시고, 반드시 Vercel Project Settings의 Environment Variables에만 입력하세요.

### 🔗 배포 URL
- **Vercel Production URL**: `https://<your-project-name>.vercel.app` *(Vercel 배포 후 생성된 URL을 여기에 입력하세요)*

---

## 📋 6. 요구사항 충족 자가 점검표

| 평가 항목 | 가이드 요구사항 | LinguaCraft 구현 내용 | 충족 여부 |
|:---|:---|:---|:---:|
| **페이지/섹션 구성** | 최소 3개 이상의 페이지 또는 섹션 (메뉴 이동) | 4개 섹션 (홈/데일리, AI 첨삭실, 내 단어장, 가이드/FAQ) | ✅ 충족 |
| **반응형 디자인** | 모바일/태블릿/데스크톱 대응 | Flex/Grid 반응형 레이아웃 및 모바일 햄버거 메뉴 구현 | ✅ 충족 |
| **프론트엔드 기술** | 순수 바닐라 HTML/CSS/JS (프레임워크 금지) | Vanilla HTML, CSS, JavaScript (ES6) 100% 구현 | ✅ 충족 |
| **백엔드 기술** | Vercel Serverless Function (`api/` Python) | `api/coach.py` (BaseHTTPRequestHandler) 구현 | ✅ 충족 |
| **AI 기능 연동** | 사용자 입력 → AI 분석 → 화면 출력 | 톤 선택 + 문장 입력 → 교정/해설/대체표현/어휘 카드 출력 | ✅ 충족 |
| **실패 처리 UX** | 빈 입력 / API 오류 / 지연 타임아웃 안내 | 3종 전체 구현 (빈값 흔들림 경고, 에러 안내, 7초 지연 안내) | ✅ 충족 |
| **보너스 과제** | UX 고도화 / 데이터 영구 저장 | 다크 모드 토글, TTS 발음 듣기, LocalStorage 단어장 | ✅ 충족 |
| **제출 패키지** | 서비스 기획서, README.md, GitHub 코드 | `PLAN.md`, `README.md`, Git 이력 완비 | ✅ 충족 |
