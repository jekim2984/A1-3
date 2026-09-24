import os
import json
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

# Built-in High Quality Fallback Presets (Zero Failure Guarantee)
FALLBACK_LESSONS = {
    "seed": {
        "ko": {
            "target_sentence": "Every day is a fresh start.",
            "korean_meaning": "매일매일이 새로운 시작이에요.",
            "coach_advice": "한국어 코치: 'fresh start'는 하나의 단어처럼 '프레시-스타트'로 부드럽게 이어서 발음해보세요. 'start'의 끝 t는 너무 세게 터뜨리지 않는 것이 자연스럽습니다.",
            "rhythm_tips": "EV-ery day / is a fresh START",
            "pattern_expansions": [
                "Every morning is a new opportunity.",
                "Every moment is a chance to learn.",
                "Every step brings me closer to my goal."
            ]
        },
        "en": {
            "target_sentence": "Every day is a fresh start.",
            "korean_meaning": "매일매일이 새로운 시작이에요.",
            "coach_advice": "Native Coach: Connect 'fresh' and 'start' smoothly without a hard break. Keep your voice rising gently on 'day' and resting peacefully on 'start'!",
            "rhythm_tips": "EV-ery day / is a fresh START",
            "pattern_expansions": [
                "Every morning is a new opportunity.",
                "Every moment is a chance to learn.",
                "Every step brings me closer to my goal."
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
}

FALLBACK_RADIO = {
    "seed": [
        {"sentence": "I am capable of learning anything step by step.", "meaning": "나는 무엇이든 차근차근 배울 수 있어요."},
        {"sentence": "Every day brings new reasons to smile.", "meaning": "매일은 미소 지을 새로운 이유를 가져다줘요."},
        {"sentence": "My confidence grows stronger with each small win.", "meaning": "작은 성취마다 나의 자신감은 더 단단해져요."},
        {"sentence": "I choose to be kind to myself today.", "meaning": "오늘 나는 내 자신에게 친절하기로 선택합니다."},
        {"sentence": "Peace begins with a deep, calm breath.", "meaning": "평화는 깊고 차분한 숨 한 번에서 시작돼요."}
    ],
    "grow": [
        {"sentence": "I welcome challenges as opportunities to grow.", "meaning": "도전을 나를 성장시키는 소중한 기회로 환영합니다."},
        {"sentence": "My dedication today creates my freedom tomorrow.", "meaning": "오늘의 나의 헌신이 내일의 자유를 만듭니다."},
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
}

def call_gemini(api_key: str, system_prompt: str, user_prompt: str) -> dict:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": f"{system_prompt}\n\n[USER]:\n{user_prompt}"}]}],
        "generationConfig": {"temperature": 0.3, "responseMimeType": "application/json"}
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=12) as response:
        res = json.loads(response.read().decode("utf-8"))
        candidates = res.get("candidates", [])
        if not candidates:
            raise ValueError("Empty candidate from Gemini")
        text = candidates[0]["content"]["parts"][0]["text"]
        return json.loads(text)

def call_openai(api_key: str, system_prompt: str, user_prompt: str) -> dict:
    url = "https://api.openai.com/v1/chat/completions"
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        "temperature": 0.3,
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

            gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
            openai_key = os.environ.get("OPENAI_API_KEY", "").strip()

            # If no API key, return curated fallback preset with success flag
            if not gemini_key and not openai_key:
                if action == "radio_affirmations":
                    items = FALLBACK_RADIO.get(level, FALLBACK_RADIO["grow"])
                    self._send_json(200, {"success": True, "source": "preset", "data": items})
                else:
                    item = FALLBACK_LESSONS.get(level, FALLBACK_LESSONS["grow"]).get(coach_lang, FALLBACK_LESSONS["grow"]["ko"])
                    self._send_json(200, {"success": True, "source": "preset", "data": item})
                return

            # AI Prompt Construction
            if action == "radio_affirmations":
                system_prompt = f"""
You are the Slofa English Radio Curator.
Generate 5 uplifting, empowering, and emotionally soothing English affirmations suitable for learner level: '{level}'.
Seed = beginner, short, clear. Grow = intermediate, natural collocations. Bloom = advanced, inspiring.
Return ONLY valid JSON matching:
{{
  "affirmations": [
    {{"sentence": "English sentence", "meaning": "자연스러운 한국어 뜻"}},
    {{"sentence": "English sentence", "meaning": "자연스러운 한국어 뜻"}},
    {{"sentence": "English sentence", "meaning": "자연스러운 한국어 뜻"}},
    {{"sentence": "English sentence", "meaning": "자연스러운 한국어 뜻"}},
    {{"sentence": "English sentence", "meaning": "자연스러운 한국어 뜻"}}
  ]
}}
"""
                user_prompt = f"Create 5 affirmations for level {level}."
                if gemini_key:
                    res = call_gemini(gemini_key, system_prompt, user_prompt)
                else:
                    res = call_openai(openai_key, system_prompt, user_prompt)
                self._send_json(200, {"success": True, "source": "ai", "data": res.get("affirmations", [])})

            else:  # daily_lesson
                target_hint = body.get("target_sentence", "")
                coach_instruction = "Korean (친절한 한국어로 발음, 연음 팁 설명)" if coach_lang == "ko" else "English (Encouraging, natural native English)"
                system_prompt = f"""
You are the Slofa English Speech Coach.
Level: '{level}' (seed: beginner, grow: intermediate, bloom: advanced).
Coach Language: {coach_instruction}.
Provide a daily goal sentence, its Korean translation, rhythm/linking advice in the chosen coach language, and 3 pattern expansion sentences.
Return ONLY valid JSON matching:
{{
  "target_sentence": "English goal sentence",
  "korean_meaning": "한국어 번역",
  "coach_advice": "Detailed rhythm, linking (연음), and stress advice in the specified coach language",
  "rhythm_tips": "STRESS-marked pronunciation guide like: I FO-cus on PRO-gress",
  "pattern_expansions": [
    "Expanded sentence 1 substituting core words",
    "Expanded sentence 2 substituting core words",
    "Expanded sentence 3 substituting core words"
  ]
}}
"""
                user_prompt = f"Target sentence request for level '{level}'. Specific sentence hint if any: '{target_hint}'."
                if gemini_key:
                    res = call_gemini(gemini_key, system_prompt, user_prompt)
                else:
                    res = call_openai(openai_key, system_prompt, user_prompt)
                self._send_json(200, {"success": True, "source": "ai", "data": res})

        except Exception as e:
            # Fallback on any upstream error to keep UX seamless
            level = body.get("level", "grow")
            coach_lang = body.get("coach_lang", "ko")
            action = body.get("action", "daily_lesson")
            if action == "radio_affirmations":
                self._send_json(200, {
                    "success": True,
                    "source": "fallback",
                    "data": FALLBACK_RADIO.get(level, FALLBACK_RADIO["grow"]),
                    "notice": f"AI service temporarily busy ({str(e)}). High-quality preset loaded."
                })
            else:
                self._send_json(200, {
                    "success": True,
                    "source": "fallback",
                    "data": FALLBACK_LESSONS.get(level, FALLBACK_LESSONS["grow"]).get(coach_lang, FALLBACK_LESSONS["grow"]["ko"]),
                    "notice": f"AI service temporarily busy ({str(e)}). High-quality preset loaded."
                })
