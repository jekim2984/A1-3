/**
 * LinguaCraft - Main Application Script
 * Vanilla JavaScript (ES6+)
 * Handles: Dark Mode, Nav, Daily Idiom Quiz, AI Coach API, TTS, LocalStorage Vocab
 */

// --- 1. State Management ---
const AppState = {
  theme: localStorage.getItem('linguacraft_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  savedNotes: JSON.parse(localStorage.getItem('linguacraft_notes') || '[]'),
  currentResult: null,
  isAnalyzing: false,
  timeoutTimer: null
};

// --- 2. Daily Idioms & Quizzes Data ---
const IDIOM_COLLECTION = [
  {
    phrase: "Hit the nail on the head",
    meaning: "정곡을 찌르다, 핵심을 정확히 말하다",
    example: "When you mentioned time management, you really hit the nail on the head.",
    quiz: {
      question: "'Hit the nail on the head'의 가장 알맞은 의미는 무엇일까요?",
      options: [
        { text: "못질을 잘못해 다치다", correct: false },
        { text: "핵심과 정곡을 정확히 찌르다", correct: true },
        { text: "어려운 일에 부딪혀 포기하다", correct: false }
      ],
      explanation: "직역하면 '못의 머리를 정확히 때리다'로, 핵심이나 문제의 본질을 정확하게 짚었을 때 쓰는 대표적인 표현입니다."
    }
  },
  {
    phrase: "Call it a day",
    meaning: "오늘 일을 마무리하다, 그만 끝내다",
    example: "We've been working for 8 hours straight. Let's call it a day!",
    quiz: {
      question: "'Call it a day'는 어떤 상황에서 쓰일까요?",
      options: [
        { text: "하루 종일 약속을 기다릴 때", correct: false },
        { text: "오늘 하루의 일이나 회의를 마무리할 때", correct: true },
        { text: "낮 시간 동안 낮잠을 잘 때", correct: false }
      ],
      explanation: "업무나 일과를 끝마치고 퇴근하거나 휴식을 취할 때 원어민들이 매일같이 쓰는 표현입니다."
    }
  },
  {
    phrase: "Cut corners",
    meaning: "원칙을 무시하고 절차를 생략하다 (날림으로 하다)",
    example: "Never cut corners when it comes to user security.",
    quiz: {
      question: "'Cut corners'의 뜻으로 가장 적절한 것은?",
      options: [
        { text: "모서리를 둥글게 자르다", correct: false },
        { text: "지름길로 편안하게 산책하다", correct: false },
        { text: "비용이나 노력을 줄이려 대충 날림으로 처리하다", correct: true }
      ],
      explanation: "코너를 가로질러 시간을 아끼듯, 정석적인 절차나 품질을 생략하고 얼렁뚱땅 처리할 때 비판적으로 쓰입니다."
    }
  },
  {
    phrase: "Bite the bullet",
    meaning: "어려운 상황을 이를 악물고 버티다/받아들이다",
    example: "I hate dental visits, but I just have to bite the bullet.",
    quiz: {
      question: "'Bite the bullet'의 의미는?",
      options: [
        { text: "피할 수 없는 힘든 일을 이를 악물고 감수하다", correct: true },
        { text: "총알을 피해서 무사히 도망치다", correct: false },
        { text: "화가 나서 상대방에게 소리치다", correct: false }
      ],
      explanation: "과거 마취제 없이 수술할 때 총알을 입에 물고 고통을 참았던 것에서 유래한 표현입니다."
    }
  }
];

// Pick today's idiom by day of year or random
const todayIndex = new Date().getDate() % IDIOM_COLLECTION.length;
const currentIdiom = IDIOM_COLLECTION[todayIndex];

// --- 3. DOM Elements Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initDailyIdiom();
  initCoachSection();
  initSavedNotes();
  initFaqAccordion();
});

// --- 4. Theme Management (Dark / Light Mode) ---
function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.textContent = AppState.theme === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute('title', AppState.theme === 'dark' ? '라이트 모드로 변경' : '다크 모드로 변경');
    themeBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', AppState.theme);
  localStorage.setItem('linguacraft_theme', AppState.theme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.textContent = AppState.theme === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute('title', AppState.theme === 'dark' ? '라이트 모드로 변경' : '다크 모드로 변경');
  }
  showToast(AppState.theme === 'dark' ? '🌙 다크 모드로 전환되었습니다.' : '☀️ 라이트 모드로 전환되었습니다.');
}

// --- 5. Navigation & Mobile Menu ---
function initNavigation() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav-link');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Smooth scroll and active state
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    });
  });

  // Highlight active section on scroll
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');
      const targetNav = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        links.forEach(l => l.classList.remove('active'));
        if (targetNav) targetNav.classList.add('active');
      }
    });
  });
}

// --- 6. Today's Idiom & Quiz ---
function initDailyIdiom() {
  const phraseEl = document.getElementById('daily-idiom-phrase');
  const meaningEl = document.getElementById('daily-idiom-meaning');
  const exampleEl = document.getElementById('daily-idiom-example');
  const idiomTtsBtn = document.getElementById('daily-idiom-tts');

  if (phraseEl) phraseEl.textContent = currentIdiom.phrase;
  if (meaningEl) meaningEl.textContent = currentIdiom.meaning;
  if (exampleEl) exampleEl.textContent = `"${currentIdiom.example}"`;

  if (idiomTtsBtn) {
    idiomTtsBtn.addEventListener('click', () => {
      speakText(`${currentIdiom.phrase}. ${currentIdiom.example}`);
    });
  }

  // Render Quiz
  const questionEl = document.getElementById('quiz-question');
  const optionsContainer = document.getElementById('quiz-options');
  const feedbackEl = document.getElementById('quiz-feedback');

  if (questionEl && optionsContainer) {
    questionEl.textContent = currentIdiom.quiz.question;
    optionsContainer.innerHTML = '';

    currentIdiom.quiz.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.textContent = `${idx + 1}. ${opt.text}`;
      btn.addEventListener('click', () => {
        // Disable all buttons
        const allBtns = optionsContainer.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach(b => b.disabled = true);

        if (opt.correct) {
          btn.classList.add('correct');
          feedbackEl.style.display = 'block';
          feedbackEl.style.color = 'var(--success)';
          feedbackEl.innerHTML = `🎉 <strong>정답입니다!</strong> ${currentIdiom.quiz.explanation}`;
        } else {
          btn.classList.add('wrong');
          // Highlight correct one
          allBtns.forEach((b, i) => {
            if (currentIdiom.quiz.options[i].correct) b.classList.add('correct');
          });
          feedbackEl.style.display = 'block';
          feedbackEl.style.color = 'var(--danger)';
          feedbackEl.innerHTML = `💡 <strong>아쉽네요!</strong> ${currentIdiom.quiz.explanation}`;
        }
      });
      optionsContainer.appendChild(btn);
    });
  }
}

// --- 7. AI Writing Coach Core Logic ---
function initCoachSection() {
  const textarea = document.getElementById('user-input-text');
  const charCount = document.getElementById('char-count');
  const analyzeBtn = document.getElementById('analyze-btn');
  const sampleBtns = document.querySelectorAll('.sample-btn');
  const errorAlert = document.getElementById('input-error-alert');

  // Character count & validation
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const count = textarea.value.length;
      charCount.textContent = `${count} / 1000자`;
      if (count > 1000) {
        charCount.style.color = 'var(--danger)';
      } else {
        charCount.style.color = 'var(--text-muted)';
      }
      if (errorAlert) errorAlert.style.display = 'none';
    });
  }

  // Sample prompt buttons
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleText = btn.getAttribute('data-sample');
      const targetTone = btn.getAttribute('data-tone');
      if (textarea && sampleText) {
        textarea.value = sampleText;
        textarea.dispatchEvent(new Event('input'));
      }
      if (targetTone) {
        const toneRadio = document.querySelector(`input[name="tone"][value="${targetTone}"]`);
        if (toneRadio) toneRadio.checked = true;
      }
      showToast('샘플 예문이 입력창에 적용되었습니다.');
    });
  });

  // Submit button
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalyze);
  }

  // Setup TTS and copy buttons on result
  setupResultActionButtons();
}

async function handleAnalyze() {
  const textarea = document.getElementById('user-input-text');
  const errorAlert = document.getElementById('input-error-alert');
  const errorText = document.getElementById('input-error-text');
  const loadingBox = document.getElementById('loading-box');
  const loadingSubtext = document.getElementById('loading-subtext');
  const placeholderBox = document.getElementById('result-placeholder');
  const resultContent = document.getElementById('result-content');
  const analyzeBtn = document.getElementById('analyze-btn');

  if (AppState.isAnalyzing) return;

  const text = textarea ? textarea.value.trim() : '';
  const toneRadio = document.querySelector('input[name="tone"]:checked');
  const tone = toneRadio ? toneRadio.value : 'casual';

  // UX Requirement: Empty Input Validation
  if (!text || text.length < 2) {
    if (errorAlert && errorText) {
      errorText.textContent = '교정받을 문장을 최소 2자 이상 입력해주세요.';
      errorAlert.style.display = 'flex';
      // Shake animation
      textarea.style.borderColor = 'var(--danger)';
      setTimeout(() => { textarea.style.borderColor = 'var(--border-color)'; }, 1500);
      textarea.focus();
    }
    return;
  }

  if (text.length > 1000) {
    if (errorAlert && errorText) {
      errorText.textContent = '입력 문장이 1,000자를 초과했습니다. 문장을 조금 줄여주세요.';
      errorAlert.style.display = 'flex';
      textarea.focus();
    }
    return;
  }

  // Clear previous error
  if (errorAlert) errorAlert.style.display = 'none';

  // Enter Loading State
  AppState.isAnalyzing = true;
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span>분석 중...</span>';
  }
  if (placeholderBox) placeholderBox.style.display = 'none';
  if (resultContent) resultContent.style.display = 'none';
  if (loadingBox) loadingBox.style.display = 'block';

  // UX Requirement: Timeout / Delay Notification (After 8 seconds)
  if (AppState.timeoutTimer) clearTimeout(AppState.timeoutTimer);
  AppState.timeoutTimer = setTimeout(() => {
    if (AppState.isAnalyzing && loadingSubtext) {
      loadingSubtext.textContent = '원어민 튜터가 심층 피드백과 대체 표현을 정리하고 있습니다. 잠시만 더 기다려주세요...';
      loadingSubtext.style.color = 'var(--primary)';
    }
  }, 7000);

  try {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tone })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      handleApiError(result, response.status);
      return;
    }

    // Success! Render Result
    AppState.currentResult = result.data;
    renderCoachResult(result.data);
    showToast('✨ AI 첨삭 및 뉘앙스 분석이 완료되었습니다!');

  } catch (err) {
    console.error('Fetch error:', err);
    // Network or server crash
    renderFallbackOrError('네트워크 오류가 발생했습니다. 인터넷 연결 상태를 확인하고 잠시 후 다시 시도해주세요.');
  } finally {
    AppState.isAnalyzing = false;
    if (AppState.timeoutTimer) clearTimeout(AppState.timeoutTimer);
    if (loadingBox) loadingBox.style.display = 'none';
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '<span>✨ AI 첨삭 및 뉘앙스 분석 시작</span>';
    }
  }
}

function handleApiError(result, statusCode) {
  const loadingBox = document.getElementById('loading-box');
  const errorAlert = document.getElementById('input-error-alert');
  const errorText = document.getElementById('input-error-text');
  const placeholderBox = document.getElementById('result-placeholder');

  if (loadingBox) loadingBox.style.display = 'none';

  let msg = result.message || '서버와 통신 중 알 수 없는 오류가 발생했습니다.';
  if (result.error === 'NO_API_KEY') {
    msg = '🔑 서버에 AI API 키가 아직 설정되지 않았습니다. Vercel 환경 변수에 GEMINI_API_KEY 또는 OPENAI_API_KEY를 등록해주세요.';
  }

  if (errorAlert && errorText) {
    errorText.innerHTML = `${msg} <button class="btn btn-sm btn-secondary" style="margin-left: 0.5rem;" onclick="loadDemoResult()">데모 결과 미리보기</button>`;
    errorAlert.style.display = 'flex';
  }

  if (placeholderBox) placeholderBox.style.display = 'block';
}

function renderFallbackOrError(message) {
  const errorAlert = document.getElementById('input-error-alert');
  const errorText = document.getElementById('input-error-text');
  const placeholderBox = document.getElementById('result-placeholder');

  if (errorAlert && errorText) {
    errorText.innerHTML = `${message} <button class="btn btn-sm btn-secondary" style="margin-left: 0.5rem;" onclick="loadDemoResult()">데모 결과 보기</button>`;
    errorAlert.style.display = 'flex';
  }
  if (placeholderBox) placeholderBox.style.display = 'block';
}

// Demo fallback so users can always see what the output looks like even prior to entering API keys
window.loadDemoResult = function() {
  const demoData = {
    original_text: "I write this email because I want to ask about meeting time.",
    corrected_text: "I am writing this email to inquire about our scheduled meeting time.",
    tone: "business",
    tone_label: "정중한 비즈니스 톤",
    explanation: "1) 현재 진행되는 목적을 나타내므로 'I write' 대신 현재진행형 'I am writing'이 훨씬 자연스럽습니다.\n2) 비즈니스 이메일에서는 단순한 'want to ask'보다 격식 있고 정중한 어휘인 'inquire about'을 사용하는 것이 전문적입니다.",
    native_alternatives: [
      "I'm reaching out to confirm the details for our upcoming meeting.",
      "Could you please clarify the scheduled time for our meeting?",
      "I would appreciate it if you could let me know the meeting schedule."
    ],
    key_vocabulary: [
      { word: "inquire about", meaning: "~에 대해 문의하다 / 묻다 (격식체)" },
      { word: "reach out to", meaning: "~에게 연락을 취하다 / 소통하다" },
      { word: "upcoming", meaning: "곧 다가오는, 예정된" }
    ]
  };
  AppState.currentResult = demoData;
  renderCoachResult(demoData);
  const errorAlert = document.getElementById('input-error-alert');
  if (errorAlert) errorAlert.style.display = 'none';
  showToast('💡 데모 분석 결과가 로드되었습니다.');
};

function renderCoachResult(data) {
  const resultContent = document.getElementById('result-content');
  const toneBadge = document.getElementById('res-tone-badge');
  const sentenceEl = document.getElementById('res-sentence');
  const explanationEl = document.getElementById('res-explanation');
  const nativeList = document.getElementById('res-native-list');
  const vocabList = document.getElementById('res-vocab-list');

  if (toneBadge) toneBadge.textContent = data.tone_label || data.tone;
  if (sentenceEl) sentenceEl.textContent = data.corrected_text;
  if (explanationEl) explanationEl.textContent = data.explanation;

  // Alternatives
  if (nativeList) {
    nativeList.innerHTML = '';
    (data.native_alternatives || []).forEach(alt => {
      const li = document.createElement('li');
      li.className = 'native-item';
      li.innerHTML = `
        <span>${escapeHtml(alt)}</span>
        <button class="btn-icon btn-sm" title="발음 듣기" onclick="speakText('${escapeSingleQuotes(alt)}')">🔊</button>
      `;
      nativeList.appendChild(li);
    });
  }

  // Key Vocabulary
  if (vocabList) {
    vocabList.innerHTML = '';
    (data.key_vocabulary || []).forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'vocab-chip';
      chip.innerHTML = `
        <span class="vocab-word">${escapeHtml(item.word)}</span>
        <span>${escapeHtml(item.meaning)}</span>
      `;
      vocabList.appendChild(chip);
    });
  }

  if (resultContent) resultContent.style.display = 'block';
}

function setupResultActionButtons() {
  const copyBtn = document.getElementById('copy-result-btn');
  const ttsBtn = document.getElementById('tts-result-btn');
  const saveBtn = document.getElementById('save-vocab-btn');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!AppState.currentResult) return;
      navigator.clipboard.writeText(AppState.currentResult.corrected_text).then(() => {
        showToast('📋 교정된 문장이 클립보드에 복사되었습니다!');
      }).catch(() => {
        showToast('복사에 실패했습니다.');
      });
    });
  }

  if (ttsBtn) {
    ttsBtn.addEventListener('click', () => {
      if (!AppState.currentResult) return;
      speakText(AppState.currentResult.corrected_text);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!AppState.currentResult) return;
      saveCurrentToNotes();
    });
  }
}

// --- 8. Saved Notes & Vocabulary (LocalStorage CRUD) ---
function initSavedNotes() {
  renderSavedNotes();

  const searchInput = document.getElementById('vocab-search-input');
  const clearAllBtn = document.getElementById('clear-all-notes-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      renderSavedNotes(query);
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (AppState.savedNotes.length === 0) {
        showToast('비울 단어장이 없습니다.');
        return;
      }
      if (confirm('저장된 모든 표현을 삭제하시겠습니까?')) {
        AppState.savedNotes = [];
        localStorage.setItem('linguacraft_notes', JSON.stringify([]));
        renderSavedNotes();
        showToast('단어장이 초기화되었습니다.');
      }
    });
  }
}

function saveCurrentToNotes() {
  const data = AppState.currentResult;
  if (!data) return;

  // Check duplicate
  const exists = AppState.savedNotes.some(n => n.text === data.corrected_text);
  if (exists) {
    showToast('⚠️ 이미 단어장에 저장된 문장입니다.');
    return;
  }

  const newEntry = {
    id: Date.now(),
    text: data.corrected_text,
    original: data.original_text,
    tone: data.tone_label || data.tone,
    explanation: data.explanation,
    date: new Date().toLocaleDateString('ko-KR')
  };

  AppState.savedNotes.unshift(newEntry);
  localStorage.setItem('linguacraft_notes', JSON.stringify(AppState.savedNotes));
  renderSavedNotes();
  showToast('⭐ 내 단어장에 성공적으로 저장되었습니다!');
}

function renderSavedNotes(searchQuery = '') {
  const container = document.getElementById('saved-cards-container');
  const countBadge = document.getElementById('saved-notes-count');
  if (!container) return;

  let filtered = AppState.savedNotes;
  if (searchQuery) {
    filtered = filtered.filter(n =>
      n.text.toLowerCase().includes(searchQuery) ||
      (n.original && n.original.toLowerCase().includes(searchQuery)) ||
      (n.explanation && n.explanation.toLowerCase().includes(searchQuery))
    );
  }

  if (countBadge) countBadge.textContent = `${AppState.savedNotes.length}개`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-vocab">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">📖</p>
        <p>${searchQuery ? '검색 결과와 일치하는 표현이 없습니다.' : '아직 저장된 표현이 없습니다. AI 첨삭 후 단어장에 저장해보세요!'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'saved-card';
    card.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
          <span class="tone-badge" style="font-size: 0.75rem;">${escapeHtml(item.tone)}</span>
          <span class="saved-card-meta">${item.date}</span>
        </div>
        <p class="saved-card-text">${escapeHtml(item.text)}</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">원문: "${escapeHtml(item.original || '')}"</p>
      </div>
      <div class="saved-card-footer">
        <button class="btn btn-sm btn-secondary" onclick="speakText('${escapeSingleQuotes(item.text)}')">🔊 듣기</button>
        <button class="btn btn-sm btn-secondary" style="color: var(--danger); border-color: var(--danger-light);" onclick="deleteSavedNote(${item.id})">삭제</button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.deleteSavedNote = function(id) {
  AppState.savedNotes = AppState.savedNotes.filter(n => n.id !== id);
  localStorage.setItem('linguacraft_notes', JSON.stringify(AppState.savedNotes));
  renderSavedNotes();
  showToast('삭제되었습니다.');
};

// --- 9. FAQ Accordion ---
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

// --- 10. Utilities (SpeechSynthesis & Toast & Security) ---
window.speakText = function(text) {
  if (!('speechSynthesis' in window)) {
    showToast('이 브라우저는 음성 합성을 지원하지 않습니다.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
};

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
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeSingleQuotes(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
