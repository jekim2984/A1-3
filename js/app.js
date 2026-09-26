/**
 * Slofa English (슬로파 잉글리쉬) - Core Application Logic
 * Vanilla JavaScript (ES6+)
 * 
 * Key Features:
 *  - Dual-Track Architecture (Core Training vs Always-on Radio)
 *  - Stealth Mission-Based Auto Level Evaluation (No test anxiety!)
 *  - Word Diff Visualizer ([Pass][Warn][Miss]) & Detail Coaching Breakdown
 *  - Adaptive Learning Loop (Tomorrow's lesson reinforces today's weak points)
 *  - Custom Topic Input with Smart Persistence (Keeps topic unless changed)
 *  - Fast-Pass Routine (No 24h wait lock: step up immediately if easy!)
 *  - Radio Speed Selector (0.8x Slo / 1.0x Natural / 1.2x Fast)
 *  - Always-on Infinite Radio with On-Demand AI Affirmations Refresh
 *  - 100% Client-Side Fallback Engine (Zero Freezing)
 */

const SlofaState = {
  theme: localStorage.getItem('slofa_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  level: localStorage.getItem('slofa_level') || 'grow',
  coachLang: localStorage.getItem('slofa_coach_lang') || 'ko',
  
  // Custom Topics with Smart Persistence
  trainingTopic: localStorage.getItem('slofa_training_topic') || '성장과 자신감 (Growth & Confidence)',
  radioTopic: localStorage.getItem('slofa_radio_topic') || '평온과 마인드 힐링 (Calm & Healing)',

  // Adaptive Learning & Weak Points Memory
  weakPoints: localStorage.getItem('slofa_weak_points') || '',
  todaySpeedsTried: new Set([1.0]),
  lastSpeechResult: null,

  currentSpeed: 1.0,
  currentLesson: null,

  // Warmup & History
  yesterdaySentence: JSON.parse(localStorage.getItem('slofa_yesterday') || 'null'),
  masteredSentences: JSON.parse(localStorage.getItem('slofa_mastered') || '[]'),
  reviewQueuedSentences: JSON.parse(localStorage.getItem('slofa_radio_queue') || '[]'),

  // Radio Player State
  radioSpeed: parseFloat(localStorage.getItem('slofa_radio_speed') || '1.0'),
  radioPlaylist: [],
  radioIndex: 0,
  isRadioPlaying: false,
  radioTimer: null
};

// Rich Client-side Fallbacks Categorized by Level & Theme (Zero Freezing Guarantee)
const CLIENT_TOPIC_LESSONS = {
  growth: {
    seed: [
      {
        target_sentence: "Every small step I take builds my confidence.",
        korean_meaning: "내가 내딛는 모든 작은 발걸음이 내 자신감을 키웁니다.",
        coach_advice: "한국어 코치: 'small step'은 하나의 단어처럼 '스몰-스텝'으로 부드럽게 붙이고, 'confidence'의 첫 음절 'CON'에 맑은 강세를 실어보세요.",
        rhythm_tips: "EV-ery small STEP / builds my CON-fi-dence",
        pattern_expansions: [
          "Every small effort shapes my destiny.",
          "Every gentle breath calms my mind.",
          "Every new day brings fresh hope."
        ]
      },
      {
        target_sentence: "I am becoming stronger and wiser each day.",
        korean_meaning: "나는 매일 더 강해지고 더 지혜로워지고 있습니다.",
        coach_advice: "한국어 코치: 'stronger and'를 '스트롱거-앤드' 대신 '스트롱거-런'으로 부드럽게 연음해보세요.",
        rhythm_tips: "I am be-COM-ing STRON-ger / and WI-ser each day",
        pattern_expansions: [
          "I am becoming happier and calmer each day.",
          "I am learning faster with every try.",
          "I am building healthy daily routines."
        ]
      }
    ],
    grow: [
      {
        target_sentence: "I focus on progress, not perfection.",
        korean_meaning: "나는 완벽함이 아닌 성장에 집중합니다.",
        coach_advice: "한국어 코치: 'focus on'을 '포커선'처럼 연음하고, 'progress'의 첫 음절에 묵직한 강세를 주어 긍정적인 힘을 실어보세요. 'not' 앞에서 반 박자 쉬어가면 설득력이 높아집니다.",
        rhythm_tips: "I FO-cus on PRO-gress, / not per-FEC-tion",
        pattern_expansions: [
          "I focus on my strengths, not my weaknesses.",
          "I focus on small habits, not quick results.",
          "I focus on solutions, not the problem."
        ]
      },
      {
        target_sentence: "Challenges refine my skills and sharpen my vision.",
        korean_meaning: "도전은 나의 역량을 다듬고 내 비전을 또렷하게 만듭니다.",
        coach_advice: "한국어 코치: 're-FINE'과 'SHAR-pen'의 대조적인 강세 리듬을 살려 발화해보세요.",
        rhythm_tips: "CHAL-len-ges re-FINE my skills / and SHAR-pen my vi-sion",
        pattern_expansions: [
          "Practice refines my intuition every single day.",
          "Difficulties reveal my inner courage.",
          "Mistakes guide my path to true mastery."
        ]
      }
    ],
    bloom: [
      {
        target_sentence: "Consistency transforms ordinary efforts into extraordinary results.",
        korean_meaning: "꾸준함은 평범한 노력을 비범한 결과로 바꿉니다.",
        coach_advice: "한국어 코치: 'ordinary'와 'extraordinary'의 대조 리듬이 핵심입니다! 'trans-FORMS'와 'ex-tra-OR-di-nary'에 확신에 찬 강세를 주며 낭독해보세요.",
        rhythm_tips: "Con-SIS-ten-cy trans-FORMS / OR-di-na-ry ef-forts / in-to ex-tra-OR-di-na-ry re-sults",
        pattern_expansions: [
          "Discipline turns daily routines into lasting mastery.",
          "Patience empowers regular practice to yield remarkable skills.",
          "Persistence bridges the gap between dreams and reality."
        ]
      },
      {
        target_sentence: "Mastery requires the humility to be a perpetual beginner.",
        korean_meaning: "탁월함은 영원한 초심자로 남을 수 있는 겸손함을 요구합니다.",
        coach_advice: "한국어 코치: 'hu-MIL-i-ty'와 'per-PET-u-al'의 우아한 음절 호흡을 부드럽게 이어보세요.",
        rhythm_tips: "MAS-ter-y re-quires the hu-MIL-i-ty / to be a per-PET-u-al be-gin-ner",
        pattern_expansions: [
          "Growth demands the courage to step into the unknown.",
          "Wisdom begins with listening rather than speaking.",
          "Innovation flourishes when we question conventional limits."
        ]
      }
    ]
  },
  healing: {
    seed: [
      {
        target_sentence: "I choose peace and let go of stress.",
        korean_meaning: "나는 평온을 선택하고 스트레스를 내려놓습니다.",
        coach_advice: "한국어 코치: 'let go of'를 '렛고우-업'으로 부드럽게 이어서 발음하고, 'peace'를 길고 나직하게 소리 내보세요.",
        rhythm_tips: "I choose PEACE / and let GO of stress",
        pattern_expansions: [
          "I choose calm and breathe in gratitude.",
          "I choose stillness and quiet my mind.",
          "I choose joy in every simple thing."
        ]
      }
    ],
    grow: [
      {
        target_sentence: "I am allowed to slow down and rest deeply.",
        korean_meaning: "나는 속도를 늦추고 깊이 쉴 자격이 있습니다.",
        coach_advice: "한국어 코치: 'slow down'에서 음조를 낮추며 소파에 기대듯 발음하세요. 'rest deeply'의 'rest' 끝 t는 가볍게 처리합니다.",
        rhythm_tips: "I am al-LOWED / to slow DOWN / and rest DEEP-ly",
        pattern_expansions: [
          "I am allowed to take my time today.",
          "I am allowed to pause whenever I need.",
          "I am worthy of peace and inner silence."
        ]
      }
    ],
    bloom: [
      {
        target_sentence: "Serenity arises when I release the need to control the uncontrollable.",
        korean_meaning: "통제할 수 없는 것을 통제하려는 욕심을 내려놓을 때 진정한 평온이 찾아옵니다.",
        coach_advice: "한국어 코치: 'Se-REN-i-ty'의 두 번째 음절에 품위 있는 강세를 두고, 문장의 끝 호흡을 차분히 가라앉히세요.",
        rhythm_tips: "Se-REN-i-ty a-ri-ses / when I re-LEASE the NEED / to con-trol the un-con-TROL-la-ble",
        pattern_expansions: [
          "True wisdom blooms when we embrace life's natural flow.",
          "Inner harmony thrives when compassion replaces judgment.",
          "Clarity emerges from the silence of an unburdened mind."
        ]
      }
    ]
  }
};

const CLIENT_TOPIC_RADIO = {
  growth: {
    seed: [
      { sentence: "I am capable of learning anything step by step.", meaning: "나는 무엇이든 차근차근 배울 수 있어요." },
      { sentence: "Every day brings new reasons to smile.", meaning: "매일은 미소 지을 새로운 이유를 가져다줘요." },
      { sentence: "My confidence grows stronger with each small win.", meaning: "작은 성취마다 나의 자신감은 더 단단해져요." },
      { sentence: "I believe in my ability to create a wonderful day.", meaning: "나는 멋진 하루를 만들어낼 내 능력을 믿습니다." },
      { sentence: "Small efforts today bring big joy tomorrow.", meaning: "오늘의 작은 노력이 내일의 큰 기쁨을 가져옵니다." }
    ],
    grow: [
      { sentence: "I welcome challenges as opportunities to grow.", meaning: "도전을 나를 성장시키는 소중한 기회로 환영합니다." },
      { sentence: "My dedication today creates my freedom tomorrow.", meaning: "오늘 나의 헌신이 내일의 자유를 만듭니다." },
      { sentence: "I let go of doubt and move forward with clarity.", meaning: "의심을 내려놓고 명확함으로 전진합니다." },
      { sentence: "Small consistent actions lead to massive positive shifts.", meaning: "작고 꾸준한 행동들이 거대한 긍정적 변화를 이끕니다." },
      { sentence: "I trust my journey and celebrate my progress.", meaning: "나의 여정을 신뢰하며 나의 성장을 축하합니다." }
    ],
    bloom: [
      { sentence: "True leadership begins by mastering one's own inner mindset.", meaning: "진정한 리더십은 자신의 내면 마인드셋을 다스리는 것에서 출발합니다." },
      { sentence: "Resilience is not the absence of difficulty, but the courage to persist.", meaning: "회복탄력성은 어려움이 없는 것이 아니라 굴하지 않고 지속하는 용기입니다." },
      { sentence: "I cultivate purposeful focus amidst the distractions of the world.", meaning: "세상의 번잡함 속에서도 목적 있는 집중력을 발휘합니다." },
      { sentence: "Excellence is an enduring habit forged through daily mindfulness.", meaning: "탁월함은 일상의 자각을 통해 벼려진 지속적인 습관입니다." },
      { sentence: "I transform adversity into fuel for profound personal evolution.", meaning: "시련을 심오한 개인적 진화를 위한 연료로 탈바꿈시킵니다." }
    ]
  },
  healing: {
    seed: [
      { sentence: "Peace begins with a deep, calm breath.", meaning: "평화는 깊고 차분한 숨 한 번에서 시작돼요." },
      { sentence: "I choose to be kind to myself today.", meaning: "오늘 나는 내 자신에게 친절하기로 선택합니다." },
      { sentence: "It is okay to rest and recharge.", meaning: "잠시 쉬어가며 충전해도 다 괜찮습니다." },
      { sentence: "My mind is peaceful, my heart is light.", meaning: "내 마음은 평화롭고 내 가슴은 가볍습니다." },
      { sentence: "I release what I cannot change.", meaning: "바꿀 수 없는 것은 편안히 놓아줍니다." }
    ],
    grow: [
      { sentence: "I honor my need for silence and restoration.", meaning: "고요함과 회복을 필요로 하는 내 마음을 소중히 존중합니다." },
      { sentence: "In every breath, I welcome peace and let go of tension.", meaning: "숨을 쉴 때마다 평온을 들이마시고 긴장을 내려놓습니다." },
      { sentence: "My worth is not defined by how busy I am.", meaning: "나의 가치는 내가 얼마나 바쁜지에 따라 결정되지 않습니다." },
      { sentence: "I create space for joy, calmness, and healing today.", meaning: "오늘 나는 기쁨과 평온, 치유를 위한 공간을 만듭니다." },
      { sentence: "Quiet moments hold the greatest power to renew my spirit.", meaning: "조용한 순간들이 내 영혼을 새롭게 하는 가장 큰 힘을 지닙니다." }
    ],
    bloom: [
      { sentence: "True tranquility is anchored within, untouched by external storms.", meaning: "진정한 평온은 외부의 폭풍에 흔들리지 않는 내면에 닻을 내립니다." },
      { sentence: "I cultivate a sanctuary of stillness where clarity naturally emerges.", meaning: "자연스럽게 명료함이 피어나는 내면의 고요한 안식처를 가꿉니다." },
      { sentence: "Gentleness toward myself is the purest form of profound strength.", meaning: "나 자신을 향한 다정함은 가장 순수하고 깊은 형태의 강인함입니다." },
      { sentence: "I allow each moment to unfold with grace, patience, and acceptance.", meaning: "우아함과 인내, 수용의 마음으로 매 순간이 자연스레 펼쳐지게 둡니다." },
      { sentence: "Releasing attachment to outcomes liberates my authentic creative energy.", meaning: "결과에 대한 집착을 내려놓음으로써 나의 진정한 창조적 에너지를 해방합니다." }
    ]
  }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCoachLangToggle();
  initTrackNavigation();
  initTopicControls();
  initLevelSelector();
  initTrainingStudio();
  initRadioPlayer();
  initDashboardStats();
  initGuideFaq();
});

// --- 1. Theme Management ---
function initTheme() {
  document.documentElement.setAttribute('data-theme', SlofaState.theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.textContent = SlofaState.theme === 'dark' ? '☀️' : '🌙';
    btn.addEventListener('click', () => {
      SlofaState.theme = SlofaState.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', SlofaState.theme);
      localStorage.setItem('slofa_theme', SlofaState.theme);
      btn.textContent = SlofaState.theme === 'dark' ? '☀️' : '🌙';
      showToast(SlofaState.theme === 'dark' ? '🌙 다크 모드로 전환되었습니다.' : '☀️ 라이트 모드로 전환되었습니다.');
    });
  }
}

// --- 2. Coach Language Switch ---
function initCoachLangToggle() {
  const koBtn = document.getElementById('coach-lang-ko');
  const enBtn = document.getElementById('coach-lang-en');

  function updateButtons() {
    if (koBtn) koBtn.classList.toggle('active', SlofaState.coachLang === 'ko');
    if (enBtn) enBtn.classList.toggle('active', SlofaState.coachLang === 'en');
  }

  if (koBtn) {
    koBtn.addEventListener('click', () => {
      SlofaState.coachLang = 'ko';
      localStorage.setItem('slofa_coach_lang', 'ko');
      updateButtons();
      showToast('🇰🇷 한국어 코치 모드로 설정되었습니다.');
      loadDailyLesson();
    });
  }

  if (enBtn) {
    enBtn.addEventListener('click', () => {
      SlofaState.coachLang = 'en';
      localStorage.setItem('slofa_coach_lang', 'en');
      updateButtons();
      showToast('🇺🇸 Native English Coach mode activated.');
      loadDailyLesson();
    });
  }
  updateButtons();
}

// --- 3. Navigation ---
function initTrackNavigation() {
  const tabs = document.querySelectorAll('.track-tab-btn');
  const views = document.querySelectorAll('.track-view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      views.forEach(v => {
        v.classList.remove('active');
        if (v.id === targetId) v.classList.add('active');
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

window.switchTrack = function(targetId) {
  const targetTab = document.querySelector(`.track-tab-btn[data-target="${targetId}"]`);
  if (targetTab) targetTab.click();
};

// --- 4. Custom Topic Management with Smart Persistence ---
function initTopicControls() {
  // 1) Training Topic
  const trainingBadge = document.getElementById('training-topic-badge');
  const studioTopicTag = document.getElementById('studio-topic-tag');
  const changeTrainingBtn = document.getElementById('change-training-topic-btn');
  const trainingEditor = document.getElementById('training-topic-editor');
  const trainingInput = document.getElementById('training-topic-input');
  const saveTrainingBtn = document.getElementById('save-training-topic-btn');
  const cancelTrainingBtn = document.getElementById('cancel-training-topic-btn');

  function updateTrainingTopicUI() {
    if (trainingBadge) trainingBadge.textContent = SlofaState.trainingTopic;
    if (studioTopicTag) studioTopicTag.textContent = SlofaState.trainingTopic;
    if (trainingInput) trainingInput.value = SlofaState.trainingTopic;
  }
  updateTrainingTopicUI();

  if (changeTrainingBtn && trainingEditor) {
    changeTrainingBtn.addEventListener('click', () => {
      trainingEditor.style.display = trainingEditor.style.display === 'none' ? 'block' : 'none';
      if (trainingEditor.style.display === 'block' && trainingInput) {
        trainingInput.focus();
      }
    });
  }

  if (cancelTrainingBtn && trainingEditor) {
    cancelTrainingBtn.addEventListener('click', () => {
      trainingEditor.style.display = 'none';
    });
  }

  if (saveTrainingBtn && trainingInput) {
    saveTrainingBtn.addEventListener('click', () => {
      const val = trainingInput.value.trim();
      if (!val) {
        trainingInput.classList.add('input-shake');
        setTimeout(() => trainingInput.classList.remove('input-shake'), 400);
        showToast('⚠️ 연습하고 싶은 주제나 관심사를 입력해주세요! (필수값 누락 방지)');
        return;
      }
      SlofaState.trainingTopic = val;
      localStorage.setItem('slofa_training_topic', val);
      updateTrainingTopicUI();
      if (trainingEditor) trainingEditor.style.display = 'none';
      showToast(`🎯 주제가 [${val}]으로 설정되었습니다! 맞춤 문장을 생성합니다.`);
      loadDailyLesson();
    });
  }

  // Quick Tags for Training
  const trainingTags = document.querySelectorAll('.topic-editor-panel:not(#radio-theme-editor) .tag-pill');
  trainingTags.forEach(pill => {
    pill.addEventListener('click', () => {
      const topicVal = pill.getAttribute('data-topic');
      if (trainingInput) trainingInput.value = topicVal;
    });
  });

  // 2) Radio Theme
  const radioBadge = document.getElementById('radio-theme-badge');
  const radioIndicator = document.getElementById('radio-theme-indicator');
  const changeRadioBtn = document.getElementById('change-radio-theme-btn');
  const radioEditor = document.getElementById('radio-theme-editor');
  const radioInput = document.getElementById('radio-theme-input');
  const saveRadioBtn = document.getElementById('save-radio-theme-btn');
  const cancelRadioBtn = document.getElementById('cancel-radio-theme-btn');

  function updateRadioThemeUI() {
    if (radioBadge) radioBadge.textContent = SlofaState.radioTopic;
    if (radioIndicator) radioIndicator.textContent = `[${SlofaState.radioTopic}]`;
    if (radioInput) radioInput.value = SlofaState.radioTopic;
  }
  updateRadioThemeUI();

  if (changeRadioBtn && radioEditor) {
    changeRadioBtn.addEventListener('click', () => {
      radioEditor.style.display = radioEditor.style.display === 'none' ? 'block' : 'none';
      if (radioEditor.style.display === 'block' && radioInput) {
        radioInput.focus();
      }
    });
  }

  if (cancelRadioBtn && radioEditor) {
    cancelRadioBtn.addEventListener('click', () => {
      radioEditor.style.display = 'none';
    });
  }

  if (saveRadioBtn && radioInput) {
    saveRadioBtn.addEventListener('click', () => {
      const val = radioInput.value.trim();
      if (!val) {
        radioInput.classList.add('input-shake');
        setTimeout(() => radioInput.classList.remove('input-shake'), 400);
        showToast('⚠️ 라디오로 듣고 싶은 테마를 입력해주세요! (필수값 누락 방지)');
        return;
      }
      SlofaState.radioTopic = val;
      localStorage.setItem('slofa_radio_topic', val);
      updateRadioThemeUI();
      if (radioEditor) radioEditor.style.display = 'none';
      showToast(`📻 라디오 테마가 [${val}]으로 설정되었습니다! 새 플레이리스트를 편성합니다.`);
      fetchRadioAffirmations(true);
    });
  }

  // Quick Tags for Radio
  const radioTags = document.querySelectorAll('#radio-theme-editor .tag-pill');
  radioTags.forEach(pill => {
    pill.addEventListener('click', () => {
      const topicVal = pill.getAttribute('data-topic');
      if (radioInput) radioInput.value = topicVal;
    });
  });

  // Fetch Next Random Button
  const nextRandomBtn = document.getElementById('fetch-next-random-btn');
  if (nextRandomBtn) {
    nextRandomBtn.addEventListener('click', () => {
      showToast('🎲 현재 주제의 새로운 긍정 문장을 불러옵니다...');
      loadDailyLesson('', true);
    });
  }
}

// --- 5. Level Selector & Stealth Indicator ---
function initLevelSelector() {
  const levelBtns = document.querySelectorAll('.level-pill-btn');
  levelBtns.forEach(btn => {
    const lvl = btn.getAttribute('data-level');
    if (lvl === SlofaState.level) btn.classList.add('active');
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SlofaState.level = lvl;
      localStorage.setItem('slofa_level', lvl);
      updateLevelBadge();
      loadDailyLesson();
      refreshRadioPlaylist();
      showToast(`레벨이 [${getLevelName(lvl)}]으로 설정되었습니다.`);
    });
  });
  updateLevelBadge();
}

function updateLevelBadge() {
  const badge = document.getElementById('current-level-badge');
  if (badge) badge.textContent = getLevelName(SlofaState.level);

  const levelBtns = document.querySelectorAll('.level-pill-btn');
  levelBtns.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-level') === SlofaState.level);
  });
}

function getLevelName(lvl) {
  if (lvl === 'seed') return '🌱 Seed (초급)';
  if (lvl === 'bloom') return '🌸 Bloom (고급)';
  return '🌿 Grow (중급)';
}

// --- 6. Track 1: Training Studio Core ---
function initTrainingStudio() {
  initSpeedButtons();
  initActionButtons();
  initReviewFork();
  loadDailyLesson();
}

function initSpeedButtons() {
  const speedBtns = document.querySelectorAll('.speed-btn');
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const rate = parseFloat(btn.getAttribute('data-speed'));
      SlofaState.currentSpeed = rate;
      SlofaState.todaySpeedsTried.add(rate);

      const labels = {
        0.8: '🐢 0.8x Slo(w) 연음 정밀 분석 모드',
        1.0: '🚶 1.0x Natural 표준 체득 모드',
        1.2: '🏎️ 1.2x Fast 순발력 극대화 모드'
      };
      showToast(labels[rate] || `${rate}x 속도`);

      if (SlofaState.currentLesson) {
        speakSentence(SlofaState.currentLesson.target_sentence, rate);
      }
    });
  });
}

function initActionButtons() {
  const playBtn = document.getElementById('studio-play-btn');
  const micBtn = document.getElementById('studio-mic-btn');

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (SlofaState.currentLesson) {
        speakSentence(SlofaState.currentLesson.target_sentence, SlofaState.currentSpeed);
      }
    });
  }

  if (micBtn) {
    micBtn.addEventListener('click', handleSpeechRecognition);
  }
}

// --- STT Speech Recognition with Word Diff Visualizer & Detail Coaching ---
function handleSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const panel = document.getElementById('speech-test-panel');
  const statusEl = document.getElementById('speech-result-status');
  const diffEl = document.getElementById('speech-word-diff');
  const detailBox = document.getElementById('speech-detail-box');
  const evalCard = document.getElementById('auto-eval-card');

  if (!SpeechRecognition) {
    showToast('⚠️ 현재 브라우저는 마이크 음성 인식을 지원하지 않습니다. (크롬 권장)');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  if (panel) panel.style.display = 'block';
  if (statusEl) statusEl.innerHTML = '<span class="mic-active-pulse">🎙️ 듣고 있습니다... 문장을 자신 있게 낭독하세요!</span>';
  if (diffEl) diffEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">음성 인식 중...</div>';
  if (detailBox) detailBox.innerHTML = '';
  if (evalCard) evalCard.style.display = 'none';

  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript;
    const target = SlofaState.currentLesson ? SlofaState.currentLesson.target_sentence : '';
    
    // Analyze word-by-word diff
    const analysis = analyzeWordDiff(target, spoken);
    SlofaState.lastSpeechResult = {
      accuracy: analysis.accuracy,
      spoken,
      target,
      analysis
    };

    // Render Status
    if (statusEl) {
      let icon = analysis.accuracy >= 80 ? '🎉' : (analysis.accuracy >= 50 ? '👍' : '💪');
      statusEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <span>${icon} 발화 일치도: <strong style="color: var(--primary); font-size: 1.2rem;">${analysis.accuracy}%</strong></span>
          <span style="font-size: 0.85rem; color: var(--text-muted);">인식된 음성: "${escapeHtml(spoken)}"</span>
        </div>
      `;
    }

    // Render Word Diff Visualizer
    if (diffEl) {
      diffEl.innerHTML = '';
      analysis.wordResults.forEach(item => {
        const badge = document.createElement('span');
        badge.className = `word-badge word-${item.status}`;
        let statusIcon = item.status === 'pass' ? '🟢' : (item.status === 'warn' ? '🟠' : '🔴');
        badge.innerHTML = `${statusIcon} ${escapeHtml(item.word)}`;
        badge.title = item.status === 'pass' ? '정확히 발음됨' : (item.status === 'warn' ? '발음 주의/연음 미흡' : '누락되었거나 발음 불일치');
        diffEl.appendChild(badge);
      });
    }

    // Render Detail Breakdown Box
    if (detailBox) {
      renderDetailCoachingBox(detailBox, analysis, target);
    }

    // Trigger Stealth Auto Level Evaluation
    triggerAutoLevelEvaluation(analysis.accuracy, spoken, target);
  };

  recognition.onerror = (event) => {
    if (statusEl) {
      statusEl.textContent = '음성 인식 시간이 초과되었거나 마이크 접근 권한이 없습니다. 마이크 허용 후 다시 시도해주세요.';
    }
  };

  recognition.start();
}

// Word Diff Matching Algorithm
function analyzeWordDiff(targetSentence, spokenSentence) {
  const clean = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const targetWords = clean(targetSentence).split(/\s+/).filter(Boolean);
  const spokenWords = clean(spokenSentence).split(/\s+/).filter(Boolean);

  let passed = 0;
  const wordResults = [];
  const missedWords = [];
  const warnWords = [];

  targetWords.forEach(tw => {
    if (spokenWords.includes(tw)) {
      passed++;
      wordResults.push({ word: tw, status: 'pass' });
    } else {
      // Check partial match (linking or minor articulation difference)
      const partial = spokenWords.some(sw => sw.startsWith(tw.substring(0, 3)) || tw.startsWith(sw.substring(0, 3)));
      if (partial) {
        passed += 0.5;
        warnWords.push(tw);
        wordResults.push({ word: tw, status: 'warn' });
      } else {
        missedWords.push(tw);
        wordResults.push({ word: tw, status: 'miss' });
      }
    }
  });

  const accuracy = Math.min(100, Math.round((passed / Math.max(targetWords.length, 1)) * 100));

  return {
    accuracy,
    wordResults,
    missedWords,
    warnWords,
    totalCount: targetWords.length
  };
}

// Render Detailed Breakdown Explanation
function renderDetailCoachingBox(container, analysis, targetSentence) {
  let html = '';

  // 1. Missing / Articulation Guide
  if (analysis.missedWords.length > 0) {
    html += `
      <div class="detail-coach-item">
        <span class="coach-point-tag tag-pron">🎯 발음 & 누락 단어</span>
        <div>
          단어 <strong>'${analysis.missedWords.join("', '")}'</strong> 발음이 뭉개졌거나 생략되었습니다. 입술과 혀의 위치를 명확히 잡고 한 번 더 또렷하게 소리 내보세요.
        </div>
      </div>
    `;
  } else if (analysis.warnWords.length > 0) {
    html += `
      <div class="detail-coach-item">
        <span class="coach-point-tag tag-pron">👍 발음 다듬기</span>
        <div>
          단어 <strong>'${analysis.warnWords.join("', '")}'</strong>의 뉘앙스가 약간 어색합니다. 0.8x 속도로 천천히 들으면서 원어민의 입모양 호흡을 따라 해보세요.
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="detail-coach-item">
        <span class="coach-point-tag" style="background: rgba(16,185,129,0.15); color: var(--accent-green);">✨ 완벽한 전달력</span>
        <div>
          모든 단어를 누락 없이 또렷하고 유창하게 발화하셨습니다! 발음과 전달력이 매우 훌륭합니다.
        </div>
      </div>
    `;
  }

  // 2. Linking & Rhythm Guide
  html += `
    <div class="detail-coach-item">
      <span class="coach-point-tag tag-link">🎵 연음 & 리듬감</span>
      <div>
        단어를 따로따로 끊어서 읽기보다, 단어 사이를 물 흐르듯 이어주는 것이 원어민 영어의 핵심입니다. 0.8x로 뼈대 억양을 몸에 익힌 뒤 1.2x로 순발력을 높여보세요.
      </div>
    </div>
  `;

  // 3. Next Lesson Loop Note
  if (analysis.missedWords.length > 0) {
    const weakWord = analysis.missedWords[0];
    SlofaState.weakPoints = `취약 단어/사운드: ${weakWord}`;
    localStorage.setItem('slofa_weak_points', SlofaState.weakPoints);
    html += `
      <div class="detail-coach-item">
        <span class="coach-point-tag tag-next">🔄 다음 수업 연계</span>
        <div>
          오늘 아쉬웠던 <strong>'${weakWord}'</strong> 발음 요소를 기억했습니다. 다음 문장 출제 시 이 사운드를 극복할 수 있는 맞춤 문장을 우선 배정합니다!
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// Trigger Stealth Auto Level Evaluation
async function triggerAutoLevelEvaluation(accuracy, spoken, target) {
  const evalCard = document.getElementById('auto-eval-card');
  if (!evalCard) return;

  const speeds = Array.from(SlofaState.todaySpeedsTried);

  try {
    const res = await fetch('/api/slofa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'level_eval',
        accuracy,
        spoken_text: spoken,
        target_sentence: target,
        speeds_tried: speeds,
        choice: 'ongoing'
      })
    });

    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      // Auto-assign new level if appropriate
      if (d.assigned_level && d.assigned_level !== SlofaState.level) {
        SlofaState.level = d.assigned_level;
        localStorage.setItem('slofa_level', d.assigned_level);
        updateLevelBadge();
      }

      evalCard.style.display = 'block';
      evalCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
          <span style="font-size: 1.3rem;">🤖</span>
          <strong style="font-size: 1rem; color: var(--primary);">Slofa 미션 수행 분석 완료</strong>
        </div>
        <div class="eval-level-highlight">추천 최적 레벨: ${d.level_name || getLevelName(SlofaState.level)}</div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-top: 0.4rem;">
          ${escapeHtml(d.summary)}
        </p>
      `;
    }
  } catch (err) {
    // Client fallback evaluation
    let autoLvl = SlofaState.level;
    let summary = '';
    if (accuracy >= 85 && speeds.includes(1.2)) {
      autoLvl = 'bloom';
      summary = `1.2배속 초고속 발화에서도 일치도 ${accuracy}%를 기록하며 뛰어난 순발력을 보여주셨습니다! 내일부터는 가장 깊이 있는 Bloom(고급) 레벨로 자동 상향 배정되었습니다.`;
    } else if (accuracy >= 60) {
      autoLvl = 'grow';
      summary = `표준 속도에서 일치도 ${accuracy}%로 균형 잡힌 호흡을 보여주셨습니다. 현재 가장 알맞은 Grow(중급) 레벨로 최적 배정되었습니다.`;
    } else {
      autoLvl = 'seed';
      summary = `편안하게 소파에 기대어 연음을 귀에 익힐 수 있도록 부담 없는 Seed(초급) 레벨로 설정되었습니다.`;
    }

    SlofaState.level = autoLvl;
    localStorage.setItem('slofa_level', autoLvl);
    updateLevelBadge();

    evalCard.style.display = 'block';
    evalCard.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
        <span style="font-size: 1.3rem;">🤖</span>
        <strong style="font-size: 1rem; color: var(--primary);">Slofa 미션 수행 분석 완료</strong>
      </div>
      <div class="eval-level-highlight">현재 배정 레벨: ${getLevelName(autoLvl)}</div>
      <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-top: 0.4rem;">
        ${summary}
      </p>
    `;
  }
}

// AI Status Badge & Visual Feedback Updater
function updateAIStatusBadge(source, customNotice = '') {
  const headerStatus = document.getElementById('header-ai-status');
  const headerText = document.getElementById('header-ai-text');
  const sourceBadge = document.getElementById('sentence-source-badge');

  if (source === 'ai') {
    if (headerStatus) {
      headerStatus.className = 'ai-status-indicator live';
      headerStatus.title = 'Google Gemini 1.5 Flash AI 실시간 연결 완료';
    }
    if (headerText) headerText.textContent = '✨ Gemini AI';
    if (sourceBadge) {
      sourceBadge.className = 'source-badge live';
      sourceBadge.textContent = '✨ Gemini 1.5 Flash AI 실시간 생성';
    }
    showToast('✨ [Gemini 1.5 Flash] AI가 맞춤 긍정 문장 작문을 완료했습니다!');
  } else {
    if (headerStatus) {
      headerStatus.className = 'ai-status-indicator preset';
      headerStatus.title = 'API Key 미등록 또는 호출 오류 (스마트 프리셋 모드)';
    }
    if (headerText) headerText.textContent = '스마트 모드';
    if (sourceBadge) {
      sourceBadge.className = 'source-badge preset';
      sourceBadge.textContent = '💡 스마트 프리셋';
    }
    if (customNotice) {
      showToast(customNotice);
    } else {
      showToast('💡 [안내] Gemini API Key 미설정으로 고품질 내장 데이터로 동작합니다. (Vercel GEMINI_API_KEY 확인)');
    }
  }
}

// Fetch Daily Lesson from Backend / API with Client Fallback & AI Feedback
async function loadDailyLesson(customSentenceHint = '', forceNextRandom = false) {
  const sentenceEl = document.getElementById('target-sentence-display');
  const meaningEl = document.getElementById('korean-meaning-display');
  const rhythmEl = document.getElementById('rhythm-tips-display');
  const coachTitle = document.getElementById('coach-title-display');
  const coachBody = document.getElementById('coach-body-display');
  const patternList = document.getElementById('pattern-expansion-list');
  const loadingBar = document.getElementById('ai-loading-indicator');

  // Show Loading Feedback
  if (loadingBar) loadingBar.style.display = 'flex';
  const delayTimer = setTimeout(() => {
    showToast('⏳ Gemini AI 응답이 지연되고 있습니다. 조금만 기다려주세요...');
  }, 5000);

  // Helper to render lesson object
  function renderLesson(data) {
    SlofaState.currentLesson = data;
    if (sentenceEl) sentenceEl.textContent = data.target_sentence;
    if (meaningEl) meaningEl.textContent = data.korean_meaning;
    if (rhythmEl) rhythmEl.textContent = `🎵 리듬 가이드: ${data.rhythm_tips || data.target_sentence}`;
    if (coachTitle) coachTitle.textContent = SlofaState.coachLang === 'ko' ? '💡 Slofa 한국어 코치 팁' : '💡 Slofa Native Coach Guide';
    if (coachBody) coachBody.textContent = data.coach_advice;

    if (patternList) {
      patternList.innerHTML = '';
      (data.pattern_expansions || []).forEach(pat => {
        const li = document.createElement('li');
        li.className = 'pattern-item';
        li.innerHTML = `
          <span>${escapeHtml(pat)}</span>
          <button class="btn-icon btn-sm" title="발음 듣기" onclick="speakSentence('${escapeSingleQuotes(pat)}', 1.0)">🔊</button>
        `;
        patternList.appendChild(li);
      });
    }

    // Reset speech test panel on new lesson
    const panel = document.getElementById('speech-test-panel');
    if (panel) panel.style.display = 'none';
  }

  // 1. Try Backend Fetch
  try {
    const res = await fetch('/api/slofa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'daily_lesson',
        level: SlofaState.level,
        coach_lang: SlofaState.coachLang,
        topic: SlofaState.trainingTopic,
        weak_points: SlofaState.weakPoints,
        target_sentence: customSentenceHint
      })
    });

    clearTimeout(delayTimer);
    if (loadingBar) loadingBar.style.display = 'none';

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      renderLesson(json.data);
      updateAIStatusBadge(json.source, json.notice);
      return;
    }
  } catch (err) {
    clearTimeout(delayTimer);
    if (loadingBar) loadingBar.style.display = 'none';
    console.warn('Backend fetch failed, using smart client fallback:', err);
    updateAIStatusBadge('preset', '⚠️ [API 알림] Gemini API 키 미등록 또는 호출 오류로 내장 스마트 데이터로 즉시 전환되었습니다.');
  }

  // 2. Seamless Client Fallback (Zero Freezing)
  const isHealing = /힐링|휴식|평온|위로|heal|calm|peace|rest/i.test(SlofaState.trainingTopic);
  const cat = isHealing ? 'healing' : 'growth';
  const list = CLIENT_TOPIC_LESSONS[cat][SlofaState.level] || CLIENT_TOPIC_LESSONS.growth.grow;
  const picked = forceNextRandom ? list[Math.floor(Math.random() * list.length)] : list[0];
  renderLesson(picked);
}

// Review Decision Fork Logic with Fast-Pass Routine
function initReviewFork() {
  const masterBtn = document.getElementById('fork-master-btn');
  const fastPassBtn = document.getElementById('fork-fastpass-btn');
  const queueRadioBtn = document.getElementById('fork-radio-btn');

  function saveToMastered() {
    if (!SlofaState.currentLesson) return;
    const sentence = SlofaState.currentLesson.target_sentence;

    if (!SlofaState.masteredSentences.some(s => s.sentence === sentence)) {
      SlofaState.masteredSentences.unshift({
        sentence,
        meaning: SlofaState.currentLesson.korean_meaning,
        date: new Date().toLocaleDateString('ko-KR')
      });
      localStorage.setItem('slofa_mastered', JSON.stringify(SlofaState.masteredSentences));
    }

    SlofaState.yesterdaySentence = {
      sentence,
      meaning: SlofaState.currentLesson.korean_meaning
    };
    localStorage.setItem('slofa_yesterday', JSON.stringify(SlofaState.yesterdaySentence));
    initDashboardStats();
  }

  if (masterBtn) {
    masterBtn.addEventListener('click', () => {
      saveToMastered();
      showToast('🏆 [완전 정복] 보관함에 저장되었습니다! 오늘 학습 출석이 완료되었습니다.');
    });
  }

  // Fast-Pass Routine (No 24h Lock!)
  if (fastPassBtn) {
    fastPassBtn.addEventListener('click', () => {
      saveToMastered();
      showToast('🚀 쉬우셨군요! 24시간 기다리지 않고 다음 단계 문장으로 바로 직행합니다.');
      loadDailyLesson('', true);
      window.scrollTo({ top: document.querySelector('.studio-box').offsetTop - 80, behavior: 'smooth' });
    });
  }

  if (queueRadioBtn) {
    queueRadioBtn.addEventListener('click', () => {
      if (!SlofaState.currentLesson) return;
      const item = {
        sentence: SlofaState.currentLesson.target_sentence,
        meaning: SlofaState.currentLesson.korean_meaning,
        isCustomReview: true
      };

      SlofaState.reviewQueuedSentences = SlofaState.reviewQueuedSentences.filter(s => s.sentence !== item.sentence);
      SlofaState.reviewQueuedSentences.unshift(item);
      localStorage.setItem('slofa_radio_queue', JSON.stringify(SlofaState.reviewQueuedSentences));

      refreshRadioPlaylist();
      showToast('📻 내일 귀 트이기 라디오 플레이리스트에 우선 등록되었습니다! BGM으로 자연스럽게 귀에 익혀보세요.');
    });
  }
}

// --- 8. Track 2: 24H Always-on Radio Logic with Speed Control & AI Refresh ---
function initRadioPlayer() {
  initRadioSpeedControls();
  fetchRadioAffirmations();

  const masterBtn = document.getElementById('master-radio-play-btn');
  const prevBtn = document.getElementById('radio-prev-btn');
  const nextBtn = document.getElementById('radio-next-btn');
  const aiRefreshBtn = document.getElementById('radio-ai-refresh-btn');

  if (masterBtn) {
    masterBtn.addEventListener('click', toggleRadioPlay);
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => changeRadioTrack(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => changeRadioTrack(1));
  }
  if (aiRefreshBtn) {
    aiRefreshBtn.addEventListener('click', () => {
      showToast('✨ 현재 테마에 맞는 새로운 긍정 확언을 AI로 불러옵니다...');
      fetchRadioAffirmations(true);
    });
  }
}

function initRadioSpeedControls() {
  const speedBtns = document.querySelectorAll('.radio-speed-btn');
  speedBtns.forEach(btn => {
    const rate = parseFloat(btn.getAttribute('data-speed'));
    if (rate === SlofaState.radioSpeed) btn.classList.add('active');

    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SlofaState.radioSpeed = rate;
      localStorage.setItem('slofa_radio_speed', rate);
      showToast(`🎚️ 라디오 재생 속도가 [${rate}x]로 변경되었습니다.`);
      if (SlofaState.isRadioPlaying) {
        playRadioSequence();
      }
    });
  });
}

// Fetch Affirmations by Theme & Level
async function fetchRadioAffirmations(appendAI = false) {
  try {
    const res = await fetch('/api/slofa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'radio_affirmations',
        level: SlofaState.level,
        topic: SlofaState.radioTopic
      })
    });

    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      if (appendAI) {
        SlofaState.radioPlaylist = [...SlofaState.reviewQueuedSentences, ...json.data, ...SlofaState.radioPlaylist];
        if (json.source === 'ai') {
          showToast('✨ [Gemini AI] 새로운 테마 확언 5문장을 실시간으로 추가했습니다!');
        } else {
          showToast('💡 [스마트 프리셋] 고품질 테마 확언이 플레이리스트에 추가되었습니다.');
        }
      } else {
        SlofaState.radioPlaylist = [...SlofaState.reviewQueuedSentences, ...json.data];
      }
      renderRadioPlaylistUI();
      updateRadioActiveTrack();
      return;
    }
  } catch (err) {
    console.warn('Radio AI fetch failed, using smart client preset:', err);
    showToast('⚠️ [라디오 안내] 서버 통신 지연으로 내장 고품질 테마 확언이 로드되었습니다.');
  }

  // Client Fallback Preset
  refreshRadioPlaylist();
}

function refreshRadioPlaylist() {
  const isHealing = /힐링|휴식|평온|위로|heal|calm|peace|rest/i.test(SlofaState.radioTopic);
  const cat = isHealing ? 'healing' : 'growth';
  const baseItems = CLIENT_TOPIC_RADIO[cat][SlofaState.level] || CLIENT_TOPIC_RADIO.growth.grow;

  SlofaState.radioPlaylist = [...SlofaState.reviewQueuedSentences, ...baseItems];
  renderRadioPlaylistUI();
  updateRadioActiveTrack();
}

function renderRadioPlaylistUI() {
  const container = document.getElementById('radio-playlist-container');
  if (!container) return;

  container.innerHTML = '';
  SlofaState.radioPlaylist.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = `playlist-item ${idx === SlofaState.radioIndex ? 'active' : ''}`;
    div.innerHTML = `
      <div style="flex: 1;">
        <div class="playlist-sentence">
          ${item.isCustomReview ? '<span class="warmup-badge" style="margin-right: 0.4rem;">복습예약</span>' : ''}
          ${escapeHtml(item.sentence)}
        </div>
        <div class="playlist-meaning">${escapeHtml(item.meaning)}</div>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button class="btn btn-sm btn-secondary" onclick="playSingleRadioIndex(${idx})">▶️ 재생</button>
        <button class="btn btn-sm btn-accent" title="트랙 1 훈련실로 가져가기" onclick="takeToStudio('${escapeSingleQuotes(item.sentence)}')">🔥 훈련실로</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function updateRadioActiveTrack() {
  const item = SlofaState.radioPlaylist[SlofaState.radioIndex];
  if (!item) return;

  const sentenceEl = document.getElementById('radio-current-sentence');
  const meaningEl = document.getElementById('radio-current-meaning');

  if (sentenceEl) sentenceEl.textContent = item.sentence;
  if (meaningEl) meaningEl.textContent = item.meaning;

  renderRadioPlaylistUI();
}

function toggleRadioPlay() {
  SlofaState.isRadioPlaying = !SlofaState.isRadioPlaying;
  const masterBtn = document.getElementById('master-radio-play-btn');
  const wave = document.getElementById('radio-visualizer-wave');

  if (SlofaState.isRadioPlaying) {
    if (masterBtn) masterBtn.textContent = '⏸️';
    if (wave) wave.classList.add('playing');
    showToast(`📻 24H 귀 트이기 라디오가 [${SlofaState.radioSpeed}x] 속도로 무한 재생됩니다.`);
    playRadioSequence();
  } else {
    if (masterBtn) masterBtn.textContent = '▶️';
    if (wave) wave.classList.remove('playing');
    window.speechSynthesis.cancel();
    if (SlofaState.radioTimer) clearTimeout(SlofaState.radioTimer);
    showToast('라디오 재생이 일시정지되었습니다.');
  }
}

// 24H Infinite Loop Sequence with Custom Radio Speed
function playRadioSequence() {
  if (!SlofaState.isRadioPlaying) return;

  const item = SlofaState.radioPlaylist[SlofaState.radioIndex];
  if (!item) return;

  updateRadioActiveTrack();

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(item.sentence);
  utterance.lang = 'en-US';
  utterance.rate = SlofaState.radioSpeed; // User selected radio speed (0.8x / 1.0x / 1.2x)

  utterance.onend = () => {
    if (!SlofaState.isRadioPlaying) return;
    SlofaState.radioTimer = setTimeout(() => {
      if (!SlofaState.isRadioPlaying) return;
      SlofaState.radioIndex = (SlofaState.radioIndex + 1) % SlofaState.radioPlaylist.length;
      playRadioSequence();
    }, 2200);
  };

  utterance.onerror = () => {
    if (!SlofaState.isRadioPlaying) return;
    SlofaState.radioTimer = setTimeout(() => {
      SlofaState.radioIndex = (SlofaState.radioIndex + 1) % SlofaState.radioPlaylist.length;
      playRadioSequence();
    }, 2000);
  };

  window.speechSynthesis.speak(utterance);
}

function changeRadioTrack(delta) {
  SlofaState.radioIndex = (SlofaState.radioIndex + delta + SlofaState.radioPlaylist.length) % SlofaState.radioPlaylist.length;
  updateRadioActiveTrack();
  if (SlofaState.isRadioPlaying) {
    playRadioSequence();
  }
}

window.playSingleRadioIndex = function(idx) {
  SlofaState.radioIndex = idx;
  if (!SlofaState.isRadioPlaying) {
    toggleRadioPlay();
  } else {
    playRadioSequence();
  }
};

// Bridge: Bring sentence from Track 2 (Radio) to Track 1 (Studio)
window.takeToStudio = function(sentence) {
  showToast(`🔥 "${sentence}" 문장을 3단 가속 훈련실로 전달했습니다!`);
  loadDailyLesson(sentence);
  switchTrack('track-training');
};

// --- 9. Dashboard & Archive Stats ---
function initDashboardStats() {
  const masterCount = document.getElementById('stat-mastered-count');
  const queueCount = document.getElementById('stat-queue-count');
  const masteredList = document.getElementById('dashboard-mastered-container');

  if (masterCount) masterCount.textContent = `${SlofaState.masteredSentences.length}개`;
  if (queueCount) queueCount.textContent = `${SlofaState.reviewQueuedSentences.length}개`;

  if (masteredList) {
    if (SlofaState.masteredSentences.length === 0) {
      masteredList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">아직 정복한 문장이 없습니다. 훈련실에서 3단 가속으로 문장을 정복해보세요!</p>';
    } else {
      masteredList.innerHTML = '';
      SlofaState.masteredSentences.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'slofa-card';
        card.style.padding = '1rem 1.25rem';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div style="font-weight: 700; font-size: 1.05rem;">${escapeHtml(item.sentence)}</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(item.meaning)} • ${item.date}</div>
            </div>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-sm btn-secondary" onclick="speakSentence('${escapeSingleQuotes(item.sentence)}', 1.0)">🔊 듣기</button>
              <button class="btn btn-sm btn-accent" onclick="takeToStudio('${escapeSingleQuotes(item.sentence)}')">다시 훈련</button>
            </div>
          </div>
        `;
        masteredList.appendChild(card);
      });
    }
  }
}

// --- 10. Guide & FAQ Accordion ---
function initGuideFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const qBtn = item.querySelector('.faq-question');
    if (qBtn) {
      qBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    }
  });
}

// --- Speech Synthesis Helper ---
window.speakSentence = function(text, rate = 1.0) {
  if (!('speechSynthesis' in window)) {
    showToast('이 브라우저는 음성 합성을 지원하지 않습니다.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
};

// --- Toast & Security Helpers ---
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeSingleQuotes(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
