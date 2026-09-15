from flask import Flask, render_template, request, jsonify
import re

app = Flask(__name__)

# Audii's starter "symbol language".
# These symbols are intentionally easy to type. The mapping can be expanded
# or replaced later with real sign-language recognition/model output.
SYMBOLS = {
    "🅰️":"A","🅱️":"B","🌜":"C","🔸":"D","📧":"E","🎏":"F","🌀":"G",
    "♓":"H","ℹ️":"I","🎷":"J","🔑":"K","👢":"L","〽️":"M","🎵":"N",
    "⭕":"O","🅿️":"P","❓":"Q","®️":"R","💲":"S","✝️":"T","♈":"U",
    "♌":"V","〰️":"W","❌":"X","💴":"Y","⚡":"Z",
    "·":" ","/":" "
}

# Optional text aliases make keyboard testing convenient.
ALIASES = {
    ":a":"A",":b":"B",":c":"C",":d":"D",":e":"E",":f":"F",":g":"G",
    ":h":"H",":i":"I",":j":"J",":k":"K",":l":"L",":m":"M",":n":"N",
    ":o":"O",":p":"P",":q":"Q",":r":"R",":s":"S",":t":"T",":u":"U",
    ":v":"V",":w":"W",":x":"X",":y":"Y",":z":"Z"
}

def decode_symbols(value: str) -> str:
    """Convert Audii symbols into normal alphabet text."""
    value = value or ""
    for alias, letter in ALIASES.items():
        value = value.replace(alias, letter)

    # Longest-first prevents multi-codepoint emoji from being split.
    for symbol, letter in sorted(SYMBOLS.items(), key=lambda item: len(item[0]), reverse=True):
        value = value.replace(symbol, letter)
    return re.sub(r"[ \t]+", " ", value).strip()

@app.route("/")
def index():
    return render_template("index.html")

@app.post("/api/translate")
def translate():
    data = request.get_json(silent=True) or {}
    symbols = str(data.get("symbols", ""))
    text = decode_symbols(symbols)
    return jsonify({"text": text, "message": "Audii translated the symbols."})

def _dist(a, b):
    return ((a["x"]-b["x"])**2 + (a["y"]-b["y"])**2 + (a["z"]-b["z"])**2) ** 0.5

def classify_hand(landmarks):
    """Small heuristic starter classifier for a few ASL-style static letters.
    It is intentionally conservative: unknown poses return '?'. This is not
    a substitute for a trained sign-language recognition model.
    """
    if not landmarks or len(landmarks) != 21:
        return {"letter": "?", "confidence": 0.0}

    # MediaPipe landmark indices:
    # wrist=0; thumb=1..4; index=5..8; middle=9..12;
    # ring=13..16; pinky=17..20.
    wrist = landmarks[0]
    tips = [8, 12, 16, 20]
    pips = [6, 10, 14, 18]

    def extended(tip, pip):
        # Finger is considered extended if its tip is farther from wrist.
        return _dist(landmarks[tip], wrist) > _dist(landmarks[pip], wrist) * 1.12

    index = extended(8, 6)
    middle = extended(12, 10)
    ring = extended(16, 14)
    pinky = extended(20, 18)

    # Thumb extension relative to index MCP. This works reasonably for
    # separated thumb poses and keeps the classifier intentionally simple.
    thumb = _dist(landmarks[4], landmarks[5]) > _dist(landmarks[3], landmarks[5]) * 1.08

    extended_count = sum([index, middle, ring, pinky])

    # L: index + thumb extended, other fingers curled.
    if index and thumb and not middle and not ring and not pinky:
        return {"letter": "L", "confidence": 0.90}

    # V: index + middle extended, ring + pinky curled.
    if index and middle and not ring and not pinky:
        return {"letter": "V", "confidence": 0.88}

    # Y: thumb + pinky extended, index/middle/ring curled.
    if thumb and pinky and not index and not middle and not ring:
        return {"letter": "Y", "confidence": 0.86}

    # B: four fingers extended, thumb curled toward palm.
    if extended_count == 4 and not thumb:
        return {"letter": "B", "confidence": 0.82}

    # A: four fingers curled, thumb separated.
    if extended_count == 0 and thumb:
        return {"letter": "A", "confidence": 0.78}

    # I: only pinky extended.
    if pinky and not index and not middle and not ring:
        return {"letter": "I", "confidence": 0.80}

    return {"letter": "?", "confidence": 0.20}

@app.post("/api/recognize")
def recognize():
    data = request.get_json(silent=True) or {}
    landmarks = data.get("landmarks", [])
    result = classify_hand(landmarks)
    return jsonify(result)

@app.get("/api/letters")
def letters():
    return jsonify([
        {"letter": chr(n), "symbol": next((s for s,v in SYMBOLS.items() if v == chr(n)), "•")}
        for n in range(ord("A"), ord("Z")+1)
    ])

if __name__ == "__main__":
    app.run(debug=True)
