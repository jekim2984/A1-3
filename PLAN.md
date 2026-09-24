# 📝 [서비스 기획서] LinguaCraft (링구아크래프트)
**AI 기반 맞춤형 영작 첨삭 & 원어민 뉘앙스 코칭 서비스**

---

## 1. 서비스 개요 및 목적 (Service Overview & Goals)

### 1.1 서비스 소개
- **서비스명**: LinguaCraft (링구아크래프트)
- **한 줄 슬로건**: "어색한 번역투 영어를 살아있는 원어민 표현으로, 나만의 AI 영작 코치"
- **서비스 목적**:
  - 한국어 화자가 영작할 때 흔히 겪는 "문법적으로는 맞지만 원어민은 쓰지 않는 어색한 직역 표현" 문제를 해결합니다.
  - 단순 오타/문법 교정을 넘어 상황과 목적(캐주얼, 비즈니스, 네이티브 구어체, 아카데믹)에 알맞은 자연스러운 뉘앙스로 교정해 줍니다.
  - 교정된 문장의 이유와 핵심 어휘를 학습하고, 나만의 단어장에 저장하여 반복 복습할 수 있는 원스톱 학습 환경을 제공합니다.

### 1.2 타겟 사용자 (Target Audience)
1. **취업 준비생 및 직장인**:
   - 영문 이메일, 슬랙 메시지, 이력서/커버레터 작성 시 비즈니스 매너에 맞는 표현이 필요한 사용자
2. **어학 시험(TOEFL, IELTS, OPIc) 준비생 및 유학생**:
   - 아카데믹하거나 자연스러운 논리 전개 및 고급 어휘 피드백이 필요한 학습자
3. **일상 회화 및 영어 일기를 쓰는 일반 학습자**:
   - 일상 표현을 원어민들이 실제 대화에서 사용하는 생생한 슬랭/이디엄으로 교정받고 싶은 사람

---

## 2. 페이지 및 섹션 구성 (Information Architecture)

웹 서비스는 모바일과 데스크톱 모두에서 원활하게 이동할 수 있는 직관적인 네비게이션(상단 고정 헤더 + 모바일 햄버거 메뉴)을 갖춘 모던 반응형 SPA(Single Page Application) 형태로 구성됩니다.

| 번호 | 섹션명 | 구성 요소 및 주요 기능 |
|:---:|:---|:---|
| **1** | **홈 / 대시보드 (Home & Today's Idiom)** | • 메인 비주얼(Hero) 및 서비스 핵심 가치 소개<br>• 매일 갱신되는 '오늘의 관용구(Idiom)' 카드 & 발음 듣기<br>• 즉석 인터랙티브 3지선다 퀴즈 (정답/오답 실시간 피드백)<br>• 주요 기능 바로가기 퀵 링크 |
| **2** | **AI 영작 첨삭실 (AI Writing Coach)** | • 영작문 입력 필드 (실시간 글자 수 카운팅 및 예시 템플릿 버튼)<br>• 4가지 첨삭 톤 선택 (캐주얼, 비즈니스, 네이티브 구어체, 아카데믹)<br>• 분석 실행 버튼 및 동적 로딩 인터랙션<br>• 결과 리포트: 교정 문장, 상세 문법/뉘앙스 해설, 원어민 추천 표현 3종, 발음 듣기(TTS), 복사하기, 단어장 저장 |
| **3** | **학습 아카이브 (My Vocabulary & Notes)** | • 내가 첨삭받고 저장한 문장과 핵심 표현 모음집 (LocalStorage 연동)<br>• 실시간 검색/필터 기능<br>• 개별 항목 오디오 발음 듣기 및 삭제 관리<br>• 데이터 내보내기/비우기 |
| **4** | **학습 가이드 & FAQ (Learning Guide & FAQ)** | • 효과적인 영작문 작성 5대 원칙 가이드<br>• 자주 묻는 질문(FAQ) 아코디언 인터페이스<br>• AI 프롬프트 팁 및 서비스 활용법 |

---

## 3. 핵심 기능 명세

### 3.1 AI 영작 코치 (Core AI Feature)
- **동작 방식**: 사용자가 작성한 문장을 선택된 톤(Tone) 옵션과 함께 백엔드 Vercel Serverless Function(`api/coach.py`)으로 전달.
- **백엔드 AI 연동**: OpenAI / Google Gemini LLM을 활용하여 구조화된 JSON 데이터로 분석 결과를 생성 및 반환.
- **결과 구성**:
  1. **교정된 최종 문장 (Polished Text)**
  2. **교정 포인트 및 뉘앙스 해설 (Detailed Grammar & Tone Feedback)**: 왜 수정되었는지 친절한 한국어 해설 제공
  3. **네이티브 추천 대체 표현 3가지 (Native Alternatives)**: 상황에 맞는 원어민 관용적 표현 제공
  4. **핵심 학습 어휘 및 이디엄 (Key Vocabulary)**: 문장에 포함된 유용한 어휘 및 뜻 풀이

### 3.2 사용자 편의 및 UX 고도화 (보너스 과제 포함)
1. **반응형 웹 디자인 (Responsive Design)**:
   - 모바일, 태블릿, 데스크톱 전 기기 완벽 지원
2. **다크 모드 / 라이트 모드 (Theme Toggle)**:
   - 사용자 시스템 테마 자동 감지 및 수동 토글 지원 (LocalStorage 저장)
3. **Web Speech API 원어민 음성 TTS**:
   - 교정된 문장 및 추천 표현을 원어민(미국/영국 영어) 발음으로 즉시 청취 가능
4. **LocalStorage 기반 영구 저장 단어장**:
   - 브라우저를 닫아도 복습할 수 있도록 로컬 스토리지에 자동 보관

---

## 4. AI 기능 입/출력 및 실패 처리 기준

### 4.1 입력 (Input) 명세
- **필수 입력**:
  - `text`: 교정받을 영어 문장 또는 초안 (문자열, 1자 이상 1,000자 이하)
- **선택 입력**:
  - `tone`: 목표 스타일 (`casual`: 편안한 일상체, `business`: 정중한 비즈니스체, `native`: 생생한 원어민 구어체, `academic`: 격식 있는 학술체)
  - `include_vocab`: 단어 추출 포함 여부 (기본값: true)

### 4.2 출력 (Output) 명세 (JSON Schema)
```json
{
  "original_text": "I am write this email to ask you about the meeting time.",
  "corrected_text": "I am writing this email to inquire about the meeting schedule.",
  "tone": "business",
  "explanation": "1) 'I am write'는 시제 오류로 'I am writing'으로 수정되었습니다. 2) 비즈니스 이메일에서는 'ask about' 대신 좀 더 정중하고 격식 있는 'inquire about'을 사용하는 것이 매너에 맞습니다.",
  "native_alternatives": [
    "I'm reaching out to confirm the time for our upcoming meeting.",
    "Could you please let me know what time works best for our meeting?",
    "I would like to check the scheduled time for our meeting."
  ],
  "key_vocabulary": [
    {"word": "inquire about", "meaning": "~에 대해 문의하다 (격식체)"},
    {"word": "reach out to", "meaning": "~에게 연락을 취하다"}
  ]
}
```

### 4.3 실패 처리 (Error Handling) 기준

| 실패 상황 (시나리오) | 감지 단계 | 사용자 안내 메시지 및 처리 UX |
|:---|:---|:---|
| **빈 입력 (공백/미입력)** | 프론트엔드 유효성 검사 | • 입력창 하단에 붉은색 경고 메시지 표시: *"교정받을 문장을 입력해주세요 (최소 2자 이상)."*<br>• 입력 필드로 자동 포커스 이동 및 진동(shake) 애니메이션 |
| **초과 입력 (1,000자 초과)** | 프론트엔드 유효성 검사 | • 글자 수 카운터 붉은색 경고 및 *"최대 1,000자까지 분석 가능합니다."* 안내 |
| **API 키 미설정 / 권한 오류 (401/403)** | 백엔드 (`api/coach.py`) | • *"API 인증 키가 설정되지 않았거나 유효하지 않습니다. 환경 변수를 확인해주세요."* 안내 카드 노출<br>• 로컬 테스트를 위한 데모 샘플 데이터 확인 옵션 제공 |
| **네트워크 단절 및 서버 에러 (500/503)** | 프론트엔드 `fetch().catch()` | • 친절한 에러 배너 노출: *"AI 코치 서버와 연결하는 도중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."*<br>• [다시 시도] 버튼 제공 |
| **응답 지연 (타임아웃 안내)** | 프론트엔드 타이머 (10초 경과) | • 10초 초과 시 로딩 문구 동적 변경: *"원어민 튜터가 심층 피드백을 작성 중입니다. 조금만 기다려주세요..."* 안내 |

---

## 5. 기술 스택 및 개발 환경

- **Frontend**: Vanilla HTML5, Vanilla CSS3 (Modern Flexbox/Grid, CSS Custom Properties), Vanilla JavaScript (ES6+, Fetch API, Web Speech API, LocalStorage)
- **Backend**: Python 3.9+ on Vercel Serverless Functions (`api/coach.py`)
- **AI Engine**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.5-flash`) 또는 OpenAI API (`gpt-4o-mini`)
- **배포 플랫폼**: Vercel (GitHub 연동 자동 배포)
