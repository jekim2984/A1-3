import os
import json
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

# Built-in High Quality Fallback Presets by Level & Topic (Zero Failure Guarantee)
FALLBACK_LESSONS_BY_TOPIC = {
    "growth": {
        "seed": {
            "ko": {
                "target_sentence": "Every small step I take builds my confidence.",
                "korean_meaning": "내가 내딛는 모든 작은 발걸음이 내 자신감을 키웁니다.",
                "coach_advice": "한국어 코치: 'small step'에서 '스몰-스텝'으로 부드럽게 넘어가고, 'confidence'의 첫 음절 'CON'에 맑은 강세를 실어보세요.",
                "rhythm_tips": "EV-ery small STEP / builds my CON-fi-dence",
                "pattern_expansions": [
                    "Every small effort shapes my destiny.",
                    "Every gentle breath calms my mind.",
                    "Every new day brings fresh hope."
                ]
            },
            "en": {
                "target_sentence": "Every small step I take builds my confidence.",
                "korean_meaning": "내가 내딛는 모든 작은 발걸음이 내 자신감을 키웁니다.",
                "coach_advice": "Native Coach: Stress 'STEP' and 'CON-fi-dence'. Keep the rhythm walking forward with a gentle bounce!",
                "rhythm_tips": "EV-ery small STEP / builds my CON-fi-dence",
                "pattern_expansions": [
                    "Every small effort shapes my destiny.",
                    "Every gentle breath calms my mind.",
                    "Every new day brings fresh hope."
                ]
            }
        },
        "grow": {
            "ko": {
                "target_sentence": "I focus on progress, not perfection.",
                "korean_meaning": "나는 완벽함이 아닌 성장에 집중합니다.",
                "coach_advice": "한국어 코치: 'focus on'을 '포커선'처럼 연음하고, 'progress'의 첫 음절에 묵직한 강세를 주어 긍정적인 힘을 실어보세요. 'not' 앞에서 반 박자 쉬어가면 설득력이 높아집니다.",
                "rhythm_tips": "I FO-cus on PRO-gress, / not per-FEC-tion",
                "pattern_expansions": [
                    "I focus on my strengths, not my weaknesses.",
                    "I focus on small habits, not quick results.",
                    "I focus on solutions, not the problem."
                ]
            },
            "en": {
                "target_sentence": "I focus on progress, not perfection.",
                "korean_meaning": "나는 완벽함이 아닌 성장에 집중합니다.",
                "coach_advice": "Native Coach: Link 'focus' and 'on' together: 'FO-kuh-sahn'. Stress the first syllable of 'PRO-gress' and pause just slightly before 'not' for dramatic contrast!",
                "rhythm_tips": "I FO-cus on PRO-gress, / not per-FEC-tion",
                "pattern_expansions": [
                    "I focus on my strengths, not my weaknesses.",
                    "I focus on small habits, not quick results.",
                    "I focus on solutions, not the problem."
                ]
            }
        },
        "bloom": {
            "ko": {
                "target_sentence": "Consistency transforms ordinary efforts into extraordinary results.",
                "korean_meaning": "꾸준함은 평범한 노력을 비범한 결과로 바꿉니다.",
                "coach_advice": "한국어 코치: 'ordinary'와 'extraordinary'의 대조 리듬이 핵심입니다! 'trans-FORMS'와 'ex-tra-OR-di-nary'에 확신에 찬 강세를 주며 낭독해보세요.",
                "rhythm_tips": "Con-SIS-ten-cy trans-FORMS / OR-di-na-ry ef-forts / in-to ex-tra-OR-di-na-ry re-sults",
                "pattern_expansions": [
                    "Discipline turns daily routines into lasting mastery.",
                    "Patience empowers regular practice to yield remarkable skills.",
                    "Persistence bridges the gap between dreams and reality."
                ]
            },
            "en": {
                "target_sentence": "Consistency transforms ordinary efforts into extraordinary results.",
                "korean_meaning": "꾸준함은 평범한 노력을 비범한 결과로 바꿉니다.",
                "coach_advice": "Native Coach: Deliver this with quiet confidence! Emphasize 'transforms' and the contrast between 'ordinary' and 'extraordinary'. Let the rhythm build up naturally.",
                "rhythm_tips": "Con-SIS-ten-cy trans-FORMS / OR-di-na-ry ef-forts / in-to ex-tra-OR-di-na-ry re-sults",
                "pattern_expansions": [
                    "Discipline turns daily routines into lasting mastery.",
                    "Patience empowers regular practice to yield remarkable skills.",
                    "Persistence bridges the gap between dreams and reality."
                ]
            }
        }
    },
    "healing": {
        "seed": {
            "ko": {
                "target_sentence": "I choose peace and let go of stress.",
                "korean_meaning": "나는 평온을 선택하고 스트레스를 내려놓습니다.",
                "coach_advice": "한국어 코치: 'let go of'를 '렛-고-오브'가 아니라 '렛고우-업'처럼 부드럽게 이어서 발음해보세요. 'peace'를 길고 편안하게 소리 내면 차분해집니다.",
                "rhythm_tips": "I choose PEACE / and let GO of stress",
                "pattern_expansions": [
                    "I choose calm and breathe in gratitude.",
                    "I choose stillness and quiet my mind.",
                    "I choose joy in every simple thing."
                ]
            },
            "en": {
                "target_sentence": "I choose peace and let go of stress.",
                "korean_meaning": "나는 평온을 선택하고 스트레스를 내려놓습니다.",
                "coach_advice": "Native Coach: Breathe out deeply on 'PEACE' and flow through 'let go of' without stopping!",
                "rhythm_tips": "I choose PEACE / and let GO of stress",
                "pattern_expansions": [
                    "I choose calm and breathe in gratitude.",
                    "I choose stillness and quiet my mind.",
                    "I choose joy in every simple thing."
                ]
            }
        },
        "grow": {
            "ko": {
                "target_sentence": "I am allowed to slow down and rest deeply.",
                "korean_meaning": "나는 속도를 늦추고 깊이 쉴 자격이 있습니다.",
                "coach_advice": "한국어 코치: 'slow down'에서 '다운'의 음조를 낮추며 편안하게 기대듯 발음하세요. 'rest deeply'의 'rest' 끝 t는 가볍게 멈춤 소리로 처리합니다.",
                "rhythm_tips": "I am al-LOWED / to slow DOWN / and rest DEEP-ly",
                "pattern_expansions": [
                    "I am allowed to take my time today.",
                    "I am allowed to pause whenever I need.",
                    "I am worthy of peace and inner silence."
                ]
            },
            "en": {
                "target_sentence": "I am allowed to slow down and rest deeply.",
                "korean_meaning": "나는 속도를 늦추고 깊이 쉴 자격이 있습니다.",
                "coach_advice": "Native Coach: Deliver this with relaxing resonance. Emphasize 'SLOW DOWN' and let your voice drop into soothing stillness on 'DEEP-ly'.",
                "rhythm_tips": "I am al-LOWED / to slow DOWN / and rest DEEP-ly",
                "pattern_expansions": [
                    "I am allowed to take my time today.",
                    "I am allowed to pause whenever I need.",
                    "I am worthy of peace and inner silence."
                ]
            }
        },
        "bloom": {
            "ko": {
                "target_sentence": "Serenity arises when I release the need to control the uncontrollable.",
                "korean_meaning": "통제할 수 없는 것을 통제하려는 욕심을 내려놓을 때 진정한 평온이 찾아옵니다.",
                "coach_advice": "한국어 코치: 'Se-REN-i-ty'의 두 번째 음절에 우아한 강세를 두고, 'control the uncontrollable'의 운율을 음미하며 낭독하세요.",
                "rhythm_tips": "Se-REN-i-ty a-ri-ses / when I re-LEASE the NEED / to con-trol the un-con-TROL-la-ble",
                "pattern_expansions": [
                    "True wisdom blooms when we embrace life's natural flow.",
                    "Inner harmony thrives when compassion replaces judgment.",
                    "Clarity emerges from the silence of an unburdened mind."
                ]
            },
            "en": {
                "target_sentence": "Serenity arises when I release the need to control the uncontrollable.",
                "korean_meaning": "통제할 수 없는 것을 통제하려는 욕심을 내려놓을 때 진정한 평온이 찾아옵니다.",
                "coach_advice": "Native Coach: Flow seamlessly through the syllables. Create a calming, philosophical cadence on 'un-con-TROL-la-ble'.",
                "rhythm_tips": "Se-REN-i-ty a-ri-ses / when I re-LEASE the NEED / to con-trol the un-con-TROL-la-ble",
                "pattern_expansions": [
                    "True wisdom blooms when we embrace life's natural flow.",
                    "Inner harmony thrives when compassion replaces judgment.",
                    "Clarity emerges from the silence of an unburdened mind."
                ]
            }
        }
    }
}

FALLBACK_RADIO_BY_TOPIC = {
    "growth": {
        "seed": [
            {"sentence": "I am capable of learning anything step by step.", "meaning": "나는 무엇이든 차근차근 배울 수 있어요."},
            {"sentence": "Every day brings new reasons to smile.", "meaning": "매일은 미소 지을 새로운 이유를 가져다줘요."},
            {"sentence": "My confidence grows stronger with each small win.", "meaning": "작은 성취마다 나의 자신감은 더 단단해져요."},
            {"sentence": "I believe in my ability to create a wonderful day.", "meaning": "나는 멋진 하루를 만들어낼 내 능력을 믿습니다."},
            {"sentence": "Small efforts today bring big joy tomorrow.", "meaning": "오늘의 작은 노력이 내일의 큰 기쁨을 가져옵니다."}
        ],
        "grow": [
            {"sentence": "I welcome challenges as opportunities to grow.", "meaning": "도전을 나를 성장시키는 소중한 기회로 환영합니다."},
            {"sentence": "My dedication today creates my freedom tomorrow.", "meaning": "오늘 나의 헌신이 내일의 자유를 만듭니다."},
            {"sentence": "I let go of doubt and move forward with clarity.", "meaning": "의심을 내려놓고 명확함으로 전진합니다."},
            {"sentence": "Small consistent actions lead to massive positive shifts.", "meaning": "작고 꾸준한 행동들이 거대한 긍정적 변화를 이끕니다."},
            {"sentence": "I trust my journey and celebrate my progress.", "meaning": "나의 여정을 신뢰하며 나의 성장을 축하합니다."}
        ],
        "bloom": [
            {"sentence": "True leadership begins by mastering one's own inner mindset.", "meaning": "진정한 리더십은 자신의 내면 마인드셋을 다스리는 것에서 출발합니다."},
            {"sentence": "Resilience is not the absence of difficulty, but the courage to persist.", "meaning": "회복탄력성은 어려움이 없는 것이 아니라 굴하지 않고 지속하는 용기입니다."},
            {"sentence": "I cultivate purposeful focus amidst the distractions of the world.", "meaning": "세상의 번잡함 속에서도 목적 있는 집중력을 발휘합니다."},
            {"sentence": "Excellence is an enduring habit forged through daily mindfulness.", "meaning": "탁월함은 일상의 자각을 통해 벼려진 지속적인 습관입니다."},
            {"sentence": "I transform adversity into fuel for profound personal evolution.", "meaning": "시련을 심오한 개인적 진화를 위한 연료로 탈바꿈시킵니다."}
        ]
    },
    "healing": {
        "seed": [
            {"sentence": "Peace begins with a deep, calm breath.", "meaning": "평화는 깊고 차분한 숨 한 번에서 시작돼요."},
            {"sentence": "I choose to be kind to myself today.", "meaning": "오늘 나는 내 자신에게 친절하기로 선택합니다."},
            {"sentence": "It is okay to rest and recharge.", "meaning": "잠시 쉬어가며 충전해도 다 괜찮습니다."},
            {"sentence": "My mind is peaceful, my heart is light.", "meaning": "내 마음은 평화롭고 내 가슴은 가볍습니다."},
            {"sentence": "I release what I cannot change.", "meaning": "바꿀 수 없는 것은 편안히 놓아줍니다."}
        ],
        "grow": [
            {"sentence": "I honor my need for silence and restoration.", "meaning": "고요함과 회복을 필요로 하는 내 마음을 소중히 존중합니다."},
            {"sentence": "In every breath, I welcome peace and let go of tension.", "meaning": "숨을 쉴 때마다 평온을 들이마시고 긴장을 내려놓습니다."},
            {"sentence": "My worth is not defined by how busy I am.", "meaning": "나의 가치는 내가 얼마나 바쁜지에 따라 결정되지 않습니다."},
            {"sentence": "I create space for joy, calmness, and healing today.", "meaning": "오늘 나는 기쁨과 평온, 치유를 위한 공간을 만듭니다."},
            {"sentence": "Quiet moments hold the greatest power to renew my spirit.", "meaning": "조용한 순간들이 내 영혼을 새롭게 하는 가장 큰 힘을 지닙니다."}
        ],
        "bloom": [
            {"sentence": "True tranquility is anchored within, untouched by external storms.", "meaning": "진정한 평온은 외부의 폭풍에 흔들리지 않는 내면에 닻을 내립니다."},
            {"sentence": "I cultivate a sanctuary of stillness where clarity naturally emerges.", "meaning": "자연스럽게 명료함이 피어나는 내면의 고요한 안식처를 가꿉니다."},
            {"sentence": "Gentleness toward myself is the purest form of profound strength.", "meaning": "나 자신을 향한 다정함은 가장 순수하고 깊은 형태의 강인함입니다."},
            {"sentence": "I allow each moment to unfold with grace, patience, and acceptance.", "meaning": "우아함과 인내, 수용의 마음으로 매 순간이 자연스레 펼쳐지게 둡니다."},
            {"sentence": "Releasing attachment to outcomes liberates my authentic creative energy.", "meaning": "결과에 대한 집착을 내려놓음으로써 나의 진정한 창조적 에너지를 해방합니다."}
        ]
    }
}

def call_gemini(api_key: str, system_prompt: str, user_prompt: str) -> dict:
    # Primary model: gemini-3.5-flash-lite with seamless backup
    models_to_try = ["gemini-3.5-flash-lite", "gemini-1.5-flash"]
    last_err = None
    for model_name in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt}\n\n[USER]:\n{user_prompt}"}]}],
                "generationConfig": {"temperature": 0.35, "responseMimeType": "application/json"}
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=12) as response:
                res = json.loads(response.read().decode("utf-8"))
                candidates = res.get("candidates", [])
                if not candidates:
                    raise ValueError(f"Empty candidate from {model_name}")
                text = candidates[0]["content"]["parts"][0]["text"]
                return json.loads(text)
        except Exception as e:
            last_err = e
            continue
    raise last_err or ValueError("Failed to generate content from Gemini API")

def call_openai(api_key: str, system_prompt: str, user_prompt: str) -> dict:
    url = "https://api.openai.com/v1/chat/completions"
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        "temperature": 0.35,
        "response_format": {"type": "json_object"}
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    })
    with urllib.request.urlopen(req, timeout=12) as response:
        res = json.loads(response.read().decode("utf-8"))
        return json.loads(res["choices"][0]["message"]["content"])

class handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body_str = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            body = json.loads(body_str) if body_str else {}

            action = body.get("action", "daily_lesson")
            level = body.get("level", "grow").lower()
            if level not in ["seed", "grow", "bloom"]:
                level = "grow"

            coach_lang = body.get("coach_lang", "ko").lower()
            if coach_lang not in ["ko", "en"]:
                coach_lang = "ko"

            topic = body.get("topic", "").strip() or "성장과 자신감 (Growth & Confidence)"
            weak_points = body.get("weak_points", "").strip()

            gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
            openai_key = os.environ.get("OPENAI_API_KEY", "").strip()

            # Determine topic category for fallbacks
            topic_category = "healing" if any(w in topic.lower() for w in ["힐링", "휴식", "평온", "위로", "heal", "calm", "peace", "rest", "sleep"]) else "growth"

            # If no API key, return curated fallback preset immediately
            if not gemini_key and not openai_key:
                if action == "radio_affirmations":
                    items = FALLBACK_RADIO_BY_TOPIC.get(topic_category, FALLBACK_RADIO_BY_TOPIC["growth"]).get(level, FALLBACK_RADIO_BY_TOPIC["growth"]["grow"])
                    self._send_json(200, {"success": True, "source": "preset", "topic": topic, "data": items})
                elif action == "level_eval":
                    self._handle_level_eval_fallback(body)
                else:  # daily_lesson
                    item = FALLBACK_LESSONS_BY_TOPIC.get(topic_category, FALLBACK_LESSONS_BY_TOPIC["growth"]).get(level, FALLBACK_LESSONS_BY_TOPIC["growth"]["grow"]).get(coach_lang, FALLBACK_LESSONS_BY_TOPIC["growth"]["grow"]["ko"])
                    self._send_json(200, {"success": True, "source": "preset", "topic": topic, "data": item})
                return

            # AI Prompt Construction
            if action == "radio_affirmations":
                system_prompt = f"""
You are the Slofa English Radio Curator.
Generate 5 uplifting, empowering, and emotionally soothing English affirmations specifically matching the learner's chosen theme: '{topic}' and level: '{level}'.
Seed = beginner, short, clear vocabulary. Grow = intermediate, natural idiomatic rhythm. Bloom = advanced, poetic and profound.
Return ONLY valid JSON:
{{
  "affirmations": [
    {{"sentence": "English sentence", "meaning": "자연스럽고 따뜻한 한국어 뜻"}},
    {{"sentence": "English sentence", "meaning": "자연스럽고 따뜻한 한국어 뜻"}},
    {{"sentence": "English sentence", "meaning": "자연스럽고 따뜻한 한국어 뜻"}},
    {{"sentence": "English sentence", "meaning": "자연스럽고 따뜻한 한국어 뜻"}},
    {{"sentence": "English sentence", "meaning": "자연스럽고 따뜻한 한국어 뜻"}}
  ]
}}
"""
                user_prompt = f"Create 5 affirmations for theme: '{topic}', level: '{level}'."
                res = call_gemini(gemini_key, system_prompt, user_prompt) if gemini_key else call_openai(openai_key, system_prompt, user_prompt)
                self._send_json(200, {"success": True, "source": "ai", "topic": topic, "data": res.get("affirmations", [])})

            elif action == "level_eval":
                self._handle_level_eval_ai(gemini_key, openai_key, body)

            else:  # daily_lesson
                target_hint = body.get("target_sentence", "")
                coach_instruction = "Korean (친절하고 따뜻한 한국어로 발음, 연음 팁 설명)" if coach_lang == "ko" else "English (Encouraging, native English speech tips)"
                system_prompt = f"""
You are the Slofa English Speech Coach.
Learner Level: '{level}' (seed: beginner, grow: intermediate, bloom: advanced).
Coach Language: {coach_instruction}.
Learner's Current Theme: '{topic}'.
Learner's Previous Weak Points (if any): '{weak_points}'.

Task:
1. Provide a daily goal sentence matching the theme '{topic}' and level '{level}'. If weak_points exist, gently reinforce those pronunciation/linking elements.
2. Provide natural Korean translation.
3. Provide detailed coach advice on rhythm, linking (연음), and stress in {coach_instruction}. (CRITICAL: Do NOT include greetings such as '안녕하세요', '반갑습니다', or introductory lines. Start directly with the core pronunciation and linking advice!)
4. Provide rhythm stress guide (e.g. I FO-cus on PRO-gress).
5. Provide 3 pattern expansion sentences that substitute core words.

Return ONLY valid JSON:
{{
  "target_sentence": "English goal sentence",
  "korean_meaning": "한국어 번역",
  "coach_advice": "Detailed rhythm and pronunciation advice tailored to learner (NO greeting words)",
  "rhythm_tips": "STRESS-marked rhythm guide",
  "pattern_expansions": [
    "Expanded sentence 1",
    "Expanded sentence 2",
    "Expanded sentence 3"
  ]
}}
"""
                user_prompt = f"Generate goal sentence for theme '{topic}', level '{level}'. Specific hint if given: '{target_hint}'."
                res = call_gemini(gemini_key, system_prompt, user_prompt) if gemini_key else call_openai(openai_key, system_prompt, user_prompt)
                self._send_json(200, {"success": True, "source": "ai", "topic": topic, "data": res})

        except Exception as e:
            level = body.get("level", "grow")
            coach_lang = body.get("coach_lang", "ko")
            action = body.get("action", "daily_lesson")
            topic = body.get("topic", "성장과 자신감")
            topic_category = "healing" if any(w in topic.lower() for w in ["힐링", "휴식", "평온", "위로", "heal", "calm", "peace"]) else "growth"

            if action == "radio_affirmations":
                self._send_json(200, {
                    "success": True,
                    "source": "fallback",
                    "topic": topic,
                    "data": FALLBACK_RADIO_BY_TOPIC.get(topic_category, FALLBACK_RADIO_BY_TOPIC["growth"]).get(level, FALLBACK_RADIO_BY_TOPIC["growth"]["grow"]),
                    "notice": f"AI service busy ({str(e)}). High-quality preset loaded."
                })
            elif action == "level_eval":
                self._handle_level_eval_fallback(body)
            else:
                self._send_json(200, {
                    "success": True,
                    "source": "fallback",
                    "topic": topic,
                    "data": FALLBACK_LESSONS_BY_TOPIC.get(topic_category, FALLBACK_LESSONS_BY_TOPIC["growth"]).get(level, FALLBACK_LESSONS_BY_TOPIC["growth"]["grow"]).get(coach_lang, FALLBACK_LESSONS_BY_TOPIC["growth"]["grow"]["ko"]),
                    "notice": f"AI service busy ({str(e)}). High-quality preset loaded."
                })

    def _handle_level_eval_ai(self, gemini_key, openai_key, body):
        acc = int(body.get("accuracy", 75))
        speeds = body.get("speeds_tried", [1.0])
        spoken = body.get("spoken_text", "")
        target = body.get("target_sentence", "")
        choice = body.get("choice", "master")

        system_prompt = """
You are the Slofa English Adaptive Learning Evaluator.
Based on the learner's mission performance (accuracy %, speeds tried, spoken text, target sentence), determine the most empowering and accurate level ('seed', 'grow', or 'bloom').
Provide an uplifting summary explaining why this level was assigned and 1-2 key pronunciation notes.
Return ONLY valid JSON:
{
  "assigned_level": "seed" | "grow" | "bloom",
  "level_name": "🌱 Seed (초급)" | "🌿 Grow (중급)" | "🌸 Bloom (고급)",
  "summary": "한국어로 따뜻하고 구체적인 성취도 및 수준 배정 총평 (2~3문장)",
  "weak_point_note": "다음 수업에 연계 반영할 핵심 발음/연음 포인트"
}
"""
        user_prompt = f"Accuracy: {acc}%, Speeds tried: {speeds}, Target: '{target}', Spoken: '{spoken}', User choice: '{choice}'."
        try:
            res = call_gemini(gemini_key, system_prompt, user_prompt) if gemini_key else call_openai(openai_key, system_prompt, user_prompt)
            self._send_json(200, {"success": True, "source": "ai", "data": res})
        except Exception:
            self._handle_level_eval_fallback(body)

    def _handle_level_eval_fallback(self, body):
        acc = int(body.get("accuracy", 75))
        speeds = body.get("speeds_tried", [1.0])
        fast_tried = 1.2 in speeds or "1.2" in [str(s) for s in speeds]
        choice = body.get("choice", "master")

        if acc >= 85 and fast_tried and choice in ["master", "fastpass"]:
            assigned = "bloom"
            name = "🌸 Bloom (고급)"
            summary = f"1.2배속 초고속 발화에서도 일치도 {acc}%를 기록하며 원어민 수준의 리듬과 순발력을 보여주셨습니다! 내일부터는 가장 깊이 있는 Bloom 레벨로 자동 상향 배정되었습니다."
        elif acc >= 60 or choice == "master":
            assigned = "grow"
            name = "🌿 Grow (중급)"
            summary = f"표준 속도에서 일치도 {acc}%로 탄탄한 영어 호흡과 연음 이해도를 보여주셨습니다. 현재 가장 균형 잡힌 성장을 이끌어낼 수 있는 Grow 레벨로 최적 배정되었습니다."
        else:
            assigned = "seed"
            name = "🌱 Seed (초급)"
            summary = f"소리에 귀를 기울이며 차근차근 음미하는 모습이 훌륭합니다. 부담 없이 소파에 기대어 연음을 귀에 익힐 수 있는 Seed(초급) 레벨로 편안하게 세팅되었습니다."

        self._send_json(200, {
            "success": True,
            "source": "rule",
            "data": {
                "assigned_level": assigned,
                "level_name": name,
                "summary": summary,
                "weak_point_note": "연음과 강세 호흡을 편안하게 유지하기"
            }
        })
