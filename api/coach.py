import os
import json
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

def call_gemini(api_key: str, system_prompt: str, user_prompt: str) -> dict:
    """Call Google Gemini 1.5 Flash via REST API."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    full_prompt = f"{system_prompt}\n\n[USER INPUT]:\n{user_prompt}"
    payload = {
        "contents": [
            {
                "parts": [{"text": full_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "responseMimeType": "application/json"
        }
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(req, timeout=25) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        candidates = res_data.get("candidates", [])
        if not candidates:
            raise ValueError("No response generated from Gemini API")
        text_content = candidates[0]["content"]["parts"][0]["text"]
        return json.loads(text_content)

def call_openai(api_key: str, system_prompt: str, user_prompt: str) -> dict:
    """Call OpenAI gpt-4o-mini via REST API."""
    url = "https://api.openai.com/v1/chat/completions"
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    )
    
    with urllib.request.urlopen(req, timeout=25) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        text_content = res_data["choices"][0]["message"]["content"]
        return json.loads(text_content)

class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, data: dict):
        self.send_response(status_code)
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
            if content_length == 0:
                self._send_json(400, {
                    "success": False,
                    "error": "EMPTY_BODY",
                    "message": "요청 본문이 비어 있습니다."
                })
                return

            body_str = self.rfile.read(content_length).decode("utf-8")
            try:
                body = json.loads(body_str)
            except json.JSONDecodeError:
                self._send_json(400, {
                    "success": False,
                    "error": "INVALID_JSON",
                    "message": "유효한 JSON 형식이 아닙니다."
                })
                return

            text = body.get("text", "").strip()
            tone = body.get("tone", "casual")

            if not text:
                self._send_json(400, {
                    "success": False,
                    "error": "EMPTY_TEXT",
                    "message": "교정받을 문장을 입력해주세요."
                })
                return

            if len(text) > 1000:
                self._send_json(400, {
                    "success": False,
                    "error": "TEXT_TOO_LONG",
                    "message": "입력 텍스트는 최대 1,000자까지 가능합니다."
                })
                return

            gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
            openai_key = os.environ.get("OPENAI_API_KEY", "").strip()

            if not gemini_key and not openai_key:
                self._send_json(503, {
                    "success": False,
                    "error": "NO_API_KEY",
                    "message": "서버에 API 키가 설정되지 않았습니다. Vercel 환경 변수에 GEMINI_API_KEY 또는 OPENAI_API_KEY를 등록해주세요."
                })
                return

            tone_descriptions = {
                "casual": "Casual & Friendly: 자연스럽고 편안한 일상 대화 또는 SNS 톤",
                "business": "Formal & Professional: 정중하고 격식 있는 비즈니스 이메일 및 업무 톤",
                "native": "Natural Native Slang/Idioms: 원어민들이 일상에서 즐겨 쓰는 구어체와 관용어",
                "academic": "Academic & Precise: 학술 에세이, 발표, 논리적이고 정제된 어휘"
            }
            tone_desc = tone_descriptions.get(tone, tone_descriptions["casual"])

            system_prompt = f"""
You are an expert native English writing coach and bilingual English-Korean tutor.
Analyze the user's English input (or Korean intended sentence) and polish it into natural, high-quality English according to the requested tone.

Requested Tone: {tone_desc}

You MUST return a valid JSON object strictly matching this schema:
{{
  "original_text": "the user's original input",
  "corrected_text": "the primary polished and corrected English sentence",
  "tone": "{tone}",
  "tone_label": "한국어 톤 명칭 (예: 정중한 비즈니스 톤)",
  "explanation": "한국어로 친절하고 명확한 첨삭 이유 및 뉘앙스 차이 설명 (문법 오류, 단어 선택 이유 등 2~3문장)",
  "native_alternatives": [
    "Alternative expression 1 (natural phrasing)",
    "Alternative expression 2 (different nuance)",
    "Alternative expression 3 (native idiomatic expression)"
  ],
  "key_vocabulary": [
    {{"word": "vocabulary or phrase 1", "meaning": "한국어 뜻 및 용법 설명"}},
    {{"word": "vocabulary or phrase 2", "meaning": "한국어 뜻 및 용법 설명"}}
  ]
}}
Do NOT output markdown backticks (like ```json), just output the raw JSON object.
"""

            # Call AI provider
            try:
                if gemini_key:
                    result = call_gemini(gemini_key, system_prompt, text)
                else:
                    result = call_openai(openai_key, system_prompt, text)

                self._send_json(200, {
                    "success": True,
                    "data": result
                })
            except urllib.error.HTTPError as e:
                err_msg = e.read().decode("utf-8", errors="ignore")
                self._send_json(502, {
                    "success": False,
                    "error": "UPSTREAM_API_ERROR",
                    "message": f"AI 서비스 호출 중 오류가 발생했습니다: {e.reason}",
                    "details": err_msg[:200]
                })
            except Exception as e:
                self._send_json(500, {
                    "success": False,
                    "error": "INTERNAL_SERVER_ERROR",
                    "message": f"서버 내부 처리 중 오류가 발생했습니다: {str(e)}"
                })

        except Exception as e:
            self._send_json(500, {
                "success": False,
                "error": "UNEXPECTED_ERROR",
                "message": f"예상치 못한 오류가 발생했습니다: {str(e)}"
            })
