/**
 * Slofa English (슬로파 잉글리쉬) - Core Application Logic
 * Vanilla JavaScript (ES6+)
 * Features:
 *  - Dual-Track Architecture (Core Training vs Always-on Radio)
 *  - Slofa 3-Speed Accel (0.8x Slo / 1.0x Natural / 1.2x Fast) via Web Speech API
 *  - 24H Infinite Radio Loop
 *  - Coach Language Switch (Korean 🇰🇷 / Native English 🇺🇸)
 *  - Warmup 10s Review & Dual-Track Review Loop
 */

const SlofaState = {
  theme: localStorage.getItem('slofa_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  level: localStorage.getItem('slofa_level') || 'grow',
  coachLang: localStorage.getItem('slofa_coach_lang') || 'ko',
  currentSpeed: 1.0,
  currentLesson: null,
  isAnalyzing: false,

  // Warmup & History
  yesterdaySentence: JSON.parse(localStorage.getItem('slofa_yesterday') || 'null'),
  masteredSentences: JSON.parse(localStorage.getItem('slofa_mastered') || '[]'),
  reviewQueuedSentences: JSON.parse(localStorage.getItem('slofa_radio_queue') || '[]'),

  // Radio Player State
  radioPlaylist: [],
  radioIndex: 0,
  isRadioPlaying: false,
  radioTimer: null
};

// Initial Radio Presets
const DEFAULT_RADIO = {
  seed: [
    { sentence: "Every day is a fresh start.", meaning: "매일매일이 새로운 시작이에요." },
    { sentence: "I am capable of learning anything step by step.", meaning: "나는 무엇이든 차근차근 배울 수 있어요." },
    { sentence: "Every day brings new reasons to smile.", meaning: "매일은 미소 지을 새로운 이유를 가져다줘요." },
    { sentence: "My confidence grows stronger with each small win.", meaning: "작은 성취마다 나의 자신감은 더 단단해져요." },
    { sentence: "I choose to be kind to myself today.", meaning: "오늘 나는 내 자신에게 친절하기로 선택합니다." }
  ],
  grow: [
    { sentence: "I focus on progress, not perfection.", meaning: "나는 완벽함이 아닌 성장에 집중합니다." },
    { sentence: "I welcome challenges as opportunities to grow.", meaning: "도전을 나를 성장시키는 소중한 기회로 환영합니다." },
    { sentence: "My dedication today creates my freedom tomorrow.", meaning: "오늘의 나의 헌신이 내일의 자유를 만듭니다." },
    { sentence: "I let go of doubt and move forward with clarity.", meaning: "의심을 내려놓고 명확함으로 전진합니다." },
    { sentence: "Small consistent actions lead to massive positive shifts.", meaning: "작고 꾸준한 행동들이 거대한 긍정적 변화를 이끕니다." }
  ],
  bloom: [
    { sentence: "Consistency transforms ordinary efforts into extraordinary results.", meaning: "꾸준함은 평범한 노력을 비범한 결과로 바꿉니다." },
    { sentence: "True leadership begins by mastering one's own inner mindset.", meaning: "진정한 리더십은 자신의 내면 마인드셋을 다스리는 것에서 출발합니다." },
    { sentence: "Resilience is not the absence of difficulty, but the courage to persist.", meaning: "회복탄력성은 어려움이 없는 것이 아니라 굴하지 않고 지속하는 용기입니다." },
    { sentence: "I cultivate purposeful focus amidst the distractions of the world.", meaning: "세상의 번잡함 속에서도 목적 있는 집중력을 발휘합니다." },
    { sentence: "Excellence is an enduring habit forged through daily mindfulness.", meaning: "탁월함은 일상의 자각을 통해 벼려진 지속적인 습관입니다." }
  ]
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCoachLangToggle();
  initTrackNavigation();
  initLevelSelector();
  initWarmupCard();
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

// --- 2. Coach Language Switch (Korean / English) ---
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

// --- 3. Dual-Track Primary Navigation ---
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

// Helper to switch track programmatically
window.switchTrack = function(targetId) {
  const targetTab = document.querySelector(`.track-tab-btn[data-target="${targetId}"]`);
  if (targetTab) targetTab.click();
};

// --- 4. Level Selector ---
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
}

function getLevelName(lvl) {
  if (lvl === 'seed') return '🌱 Seed (초급)';
  if (lvl === 'bloom') return '🌸 Bloom (고급)';
  return '🌿 Grow (중급)';
}

// --- 5. Warmup 10s Review Card ---
function initWarmupCard() {
  const card = document.getElementById('warmup-card');
  const textEl = document.getElementById('warmup-sentence-text');
  const listenBtn = document.getElementById('warmup-listen-btn');

  // If no yesterday sentence, use a welcoming warmup
  const item = SlofaState.yesterdaySentence || {
    sentence: "Every step I take builds my future.",
    meaning: "내가 내딛는 모든 발걸음이 내 미래를 만듭니다."
  };

  if (textEl) textEl.textContent = `"${item.sentence}"`;

  if (listenBtn) {
    listenBtn.addEventListener('click', () => {
      speakSentence(item.sentence, 1.0);
      showToast('🔊 어제 문장을 1.0배속으로 낭독했습니다! 이제 오늘 진도를 나가볼까요?');
    });
  }
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

      const labels = {
        0.8: '🐢 0.8x Slo(w) 연음 정밀 분석 모드',
        1.0: '🚶 1.0x Natural 표준 체득 모드',
        1.2: '🏎️ 1.2x Fast 순발력 극대화 모드'
      };
      showToast(labels[rate] || `${rate}x 속도`);

      // Auto play sentence with selected speed
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

function handleSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const panel = document.getElementById('speech-test-panel');
  const resultText = document.getElementById('speech-result-text');

  if (!SpeechRecognition) {
    showToast('⚠️ 현재 브라우저는 마이크 음성 인식을 지원하지 않습니다. (크롬 권장)');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  if (panel) panel.style.display = 'block';
  if (resultText) resultText.innerHTML = '<span class="mic-active-pulse">🎙️ 듣고 있습니다... 문장을 소리 내어 낭독하세요!</span>';

  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript;
    const target = SlofaState.currentLesson.target_sentence;
    const accuracy = calculateSimilarity(spoken, target);

    let feedbackMsg = '';
    if (accuracy >= 80) {
      feedbackMsg = `🎉 완벽합니다! (일치도 ${accuracy}%) 원어민처럼 매끄럽게 발음하셨어요.`;
    } else if (accuracy >= 50) {
      feedbackMsg = `👍 좋아요! (일치도 ${accuracy}%) 0.8배속으로 연음을 조금만 더 신경 써보세요.`;
    } else {
      feedbackMsg = `💪 괜찮아요! (일치도 ${accuracy}%) 0.8배속으로 천천히 다시 들어보고 따라 해보세요.`;
    }

    if (resultText) {
      resultText.innerHTML = `
        <div style="margin-bottom: 0.4rem;"><strong>인식된 음성:</strong> "${escapeHtml(spoken)}"</div>
        <div style="color: var(--primary); font-weight: 700;">${feedbackMsg}</div>
      `;
    }
  };

  recognition.onerror = (event) => {
    if (resultText) {
      resultText.textContent = '음성 인식 시간이 초과되었거나 마이크 접근 권한이 없습니다. 다시 시도해주세요.';
    }
  };

  recognition.start();
}

function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
  let matches = 0;
  s1.forEach(word => {
    if (s2.includes(word)) matches++;
  });
  return Math.min(100, Math.round((matches / Math.max(s1.length, s2.length)) * 100));
}

// Fetch Daily Lesson from Backend / API
async function loadDailyLesson(customSentenceHint = '') {
  const sentenceEl = document.getElementById('target-sentence-display');
  const meaningEl = document.getElementById('korean-meaning-display');
  const rhythmEl = document.getElementById('rhythm-tips-display');
  const coachTitle = document.getElementById('coach-title-display');
  const coachBody = document.getElementById('coach-body-display');
  const patternList = document.getElementById('pattern-expansion-list');

  try {
    const res = await fetch('/api/slofa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'daily_lesson',
        level: SlofaState.level,
        coach_lang: SlofaState.coachLang,
        target_sentence: customSentenceHint
      })
    });

    const json = await res.json();
    if (json.success && json.data) {
      const data = json.data;
      SlofaState.currentLesson = data;

      if (sentenceEl) sentenceEl.textContent = data.target_sentence;
      if (meaningEl) meaningEl.textContent = data.korean_meaning;
      if (rhythmEl) rhythmEl.textContent = `🎵 리듬 가이드: ${data.rhythm_tips || data.target_sentence}`;
      
      if (coachTitle) coachTitle.textContent = SlofaState.coachLang === 'ko' ? '💡 Slofa 한국어 코치 팁' : '💡 Slofa Native Coach Guide';
      if (coachBody) coachBody.textContent = data.coach_advice;

      // Render Pattern Expansions
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
    }
  } catch (err) {
    console.error('Lesson fetch error, fallback active', err);
  }
}

// Review Decision Fork Logic
function initReviewFork() {
  const masterBtn = document.getElementById('fork-master-btn');
  const queueRadioBtn = document.getElementById('fork-radio-btn');

  if (masterBtn) {
    masterBtn.addEventListener('click', () => {
      if (!SlofaState.currentLesson) return;
      const sentence = SlofaState.currentLesson.target_sentence;

      // Save to mastered
      if (!SlofaState.masteredSentences.some(s => s.sentence === sentence)) {
        SlofaState.masteredSentences.unshift({
          sentence,
          meaning: SlofaState.currentLesson.korean_meaning,
          date: new Date().toLocaleDateString('ko-KR')
        });
        localStorage.setItem('slofa_mastered', JSON.stringify(SlofaState.masteredSentences));
      }

      // Record as yesterday sentence for tomorrow's warmup
      SlofaState.yesterdaySentence = {
        sentence,
        meaning: SlofaState.currentLesson.korean_meaning
      };
      localStorage.setItem('slofa_yesterday', JSON.stringify(SlofaState.yesterdaySentence));

      initDashboardStats();
      showToast('🏆 [완전 정복] 보관함에 저장되었습니다! 내일 워밍업 문장으로 자동 등록됩니다.');
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

      // Push to radio queue
      SlofaState.reviewQueuedSentences = SlofaState.reviewQueuedSentences.filter(s => s.sentence !== item.sentence);
      SlofaState.reviewQueuedSentences.unshift(item);
      localStorage.setItem('slofa_radio_queue', JSON.stringify(SlofaState.reviewQueuedSentences));

      refreshRadioPlaylist();
      showToast('📻 내일 귀 트이기 라디오 플레이리스트에 우선 등록되었습니다! BGM으로 자연스럽게 귀에 익혀보세요.');
    });
  }
}

// --- 7. Track 2: 24H Always-on Radio Logic ---
function initRadioPlayer() {
  refreshRadioPlaylist();

  const masterBtn = document.getElementById('master-radio-play-btn');
  const prevBtn = document.getElementById('radio-prev-btn');
  const nextBtn = document.getElementById('radio-next-btn');

  if (masterBtn) {
    masterBtn.addEventListener('click', toggleRadioPlay);
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => changeRadioTrack(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => changeRadioTrack(1));
  }
}

function refreshRadioPlaylist() {
  // Combine custom review queue at top + default presets for level
  const baseItems = DEFAULT_RADIO[SlofaState.level] || DEFAULT_RADIO.grow;
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
    showToast('📻 24H 귀 트이기 라디오가 재생을 시작합니다 (무한 반복).');
    playRadioSequence();
  } else {
    if (masterBtn) masterBtn.textContent = '▶️';
    if (wave) wave.classList.remove('playing');
    window.speechSynthesis.cancel();
    if (SlofaState.radioTimer) clearTimeout(SlofaState.radioTimer);
    showToast('라디오 재생이 일시정지되었습니다.');
  }
}

// 24H Infinite Loop Sequence
function playRadioSequence() {
  if (!SlofaState.isRadioPlaying) return;

  const item = SlofaState.radioPlaylist[SlofaState.radioIndex];
  if (!item) return;

  updateRadioActiveTrack();

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(item.sentence);
  utterance.lang = 'en-US';
  utterance.rate = 0.95; // Gentle listening pace

  utterance.onend = () => {
    if (!SlofaState.isRadioPlaying) return;
    // 2.5s calm pause between sentences, then loop to next
    SlofaState.radioTimer = setTimeout(() => {
      if (!SlofaState.isRadioPlaying) return;
      SlofaState.radioIndex = (SlofaState.radioIndex + 1) % SlofaState.radioPlaylist.length;
      playRadioSequence();
    }, 2500);
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
  showToast(`🔥 "${sentence}" 문장을 Slofa 3단 가속 훈련실로 전달했습니다!`);
  loadDailyLesson(sentence);
  switchTrack('track-training');
};

// --- 8. Dashboard & Archive Stats ---
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
      SlofaState.masteredSentences.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'slofa-card';
        card.style.padding = '1rem 1.25rem';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
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

// --- 9. Guide & FAQ Accordion ---
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
