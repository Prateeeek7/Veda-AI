"""
chatbot.py — GeetaAI RAG Chatbot Backend
==========================================
Flask server that:
  1. Serves the ChatGPT-style web UI
  2. Handles /chat POST requests via RAG pipeline
  3. Uses FAISS for verse retrieval + Groq for generation

Start: python3 chatbot.py
Then open: http://localhost:5000
"""

import os
import json
import pickle
import numpy as np
from flask import Flask, request, jsonify, render_template, Response, send_file, stream_with_context
try:
    from gradio_client import Client
except ImportError:
    import os
    os.system("pip install gradio_client")
    from gradio_client import Client
from groq import Groq

app = Flask(__name__)

# ── Load index + model at startup ─────────────────────────────────────────────
print("🙏 GeetaAI Starting...")

import faiss
from sentence_transformers import SentenceTransformer

INDEX_PATH = "gita_index.faiss"
META_PATH  = "gita_meta.pkl"

if not os.path.exists(INDEX_PATH) or not os.path.exists(META_PATH):
    raise FileNotFoundError(
        "❌ Index not found! Run: python3 build_index.py first."
    )

print("⏳ Loading FAISS index...")
faiss_index = faiss.read_index(INDEX_PATH)

print("⏳ Loading verse metadata...")
with open(META_PATH, "rb") as f:
    verse_meta = pickle.load(f)

print("⏳ Loading embedding model...")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

print(f"✓ Ready — {faiss_index.ntotal} verses indexed\n")

# ── Groq client ───────────────────────────────────────────────────────────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("⚠ WARNING: GROQ_API_KEY not set. Set it with: export GROQ_API_KEY=your_key")

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# ── System prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are GeetaAI — a deeply wise and compassionate spiritual guide who answers questions using the Bhagavad Gita verses provided to you in each message.

Your rules (follow them strictly):
1. ONLY use the provided verses as your source of truth. Never add knowledge from outside these verses.
2. When referencing a verse, always cite it as "BG {chapter}.{verse}" (e.g., BG 2.47).
3. Weave the verse's wisdom into a natural, warm, conversational response — not a dry recitation.
4. If no verses are provided (e.g., the user is just saying hello), DO NOT quote any scripture. Simply offer a warm, divine greeting like "Namaste! How may the sacred wisdom of the Gita guide your path today?"
5. If verses are provided but don't answer the question, respond EXACTLY with:
   "The Gita does not directly speak to this in the passages I found. Ask me something about duty, action, devotion, the mind, the soul, or the nature of reality."
6. Never hallucinate verse numbers, Sanskrit words, or philosophical claims not present in the context.
7. Speak with warmth, clarity, and depth — like a knowledgeable friend, not a professor.
8. Keep responses between 100–300 words unless the question genuinely needs more depth.
"""

# ── RAG pipeline ──────────────────────────────────────────────────────────────
def retrieve_verses(query: str, top_k: int = 5) -> list[dict]:
    """Embed query, search FAISS, return top-k verse metadata."""
    q_vec = embed_model.encode(
        [query], normalize_embeddings=True
    ).astype("float32")
    distances, indices = faiss_index.search(q_vec, top_k)
    results = []
    for idx, score in zip(indices[0], distances[0]):
        if idx < len(verse_meta):
            entry = verse_meta[idx].copy()
            entry["score"] = float(score)
            results.append(entry)
    return results


def build_context(verses: list[dict]) -> str:
    """Format retrieved verses into a context block for the LLM."""
    parts = []
    for v in verses:
        # Use first 600 chars of meaning to keep context focused
        meaning = str(v.get("meaning", ""))
        meaning_snippet = meaning[:600] + ("..." if len(meaning) > 600 else "")
        parts.append(
            f"--- BG {v['chapter']}.{v['verse']} | {v.get('chapter_name', '')} ---\n"
            f"Sanskrit: {str(v.get('sanskrit', '')).replace(chr(10), ' ')[:120]}\n"
            f"Transliteration: {str(v.get('transliteration', '')).replace(chr(10), ' ')[:120]}\n"
            f"Translation: {v.get('translation', '')}\n"
            f"Commentary: {meaning_snippet}\n"
        )
    return "\n".join(parts)

def build_api_messages(messages_history: list, context: str) -> list:
    """Build the final messages array for the LLM including history and system prompt."""
    if not messages_history:
        return []
    
    # We only inject the context into the VERY LAST user message
    # so the model knows what it's looking at right now.
    last_msg = messages_history[-1]["content"]
    user_message = (
        f"Here are the relevant Bhagavad Gita verses for your reference:\n\n"
        f"{context}\n\n"
        f"---\n"
        f"User's query: {last_msg}\n\n"
        f"Please answer based solely on the verses above, but feel free to refer to our previous conversation if necessary."
    )
    
    api_msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add history
    for msg in messages_history[:-1]:
        role = "assistant" if msg.get("role") == "bot" else msg.get("role", "user")
        api_msgs.append({"role": role, "content": msg.get("content", "")})
        
    api_msgs.append({"role": "user", "content": user_message})
    return api_msgs


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    messages_history = data.get("messages", [])
    
    if not messages_history:
        message = (data.get("message") or "").strip()
        if not message:
            return jsonify({"error": "Empty message"}), 400
        messages_history = [{"role": "user", "content": message}]
    
    last_query = messages_history[-1]["content"]

    if not GROQ_API_KEY:
        return jsonify({
            "reply": "⚠ No GROQ_API_KEY set. Please run: export GROQ_API_KEY=your_key and restart.",
            "sources": []
        })

    try:
        # Detect if query is just a simple greeting to avoid aggressive scripture quoting
        lower_q = last_query.strip().lower()
        is_greeting = False
        greeting_words = ["hi", "hii", "hello", "hey", "namaste", "pranam"]
        if len(lower_q.split()) <= 6 and any(lower_q.startswith(g) for g in greeting_words):
            is_greeting = True
            
        verses = [] if is_greeting else retrieve_verses(last_query, top_k=5)
        context = build_context(verses)
        api_messages = build_api_messages(messages_history, context)

        # Format sources for frontend
        sources = [{
            "chapter":        v["chapter"],
            "verse":          v["verse"],
            "chapter_name":   v.get("chapter_name", ""),
            "sanskrit":       str(v.get("sanskrit", "")),
            "transliteration":str(v.get("transliteration","")),
            "translation":    str(v.get("translation","")),
            "score":          round(v.get("score", 0), 3),
        } for v in verses]

        def generate():
            # First yield the sources
            yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
            
            # Then stream the response
            stream_response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=api_messages,
                temperature=0.4,
                stream=True,
                max_tokens=1024,
            )
            for chunk in stream_response:
                delta = chunk.choices[0].delta.content or ""
                if delta:
                    yield f"data: {json.dumps({'type': 'content', 'delta': delta})}\n\n"
            
            yield f"data: [DONE]\n\n"

        return Response(generate(), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/translate-verse', methods=['POST'])
def translate_verse():
    data = request.json
    sanskrit_text = data.get('sanskrit', '')
    context = data.get('context', 'Mahabharata Verse')
    
    if not groq_client:
        return jsonify({"error": "Oracle API keys missing."}), 500
        
    system_prompt = (
        "You are GeetaAI, a sacred Oracle of Vedic wisdom.\n"
        f"The seeker has requested enlightenment on the following {context}:\n\n"
        f"\"{sanskrit_text}\"\n\n"
        "Your task is to provide:\n"
        "1. A direct, poetic English Translation of the verse.\n"
        "2. A profound Philosophical Meaning, connecting it to Dharma, Karma, or Cosmic Consciousness.\n"
        "Format your answer beautifully in Markdown using **bolding** for emphasis where appropriate. Do not write introductory fluff or conversational pleasantries, just directly output the Translation and Meaning."
    )
    
    def generate():
        try:
            stream = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "Enlighten me on this verse."}
                ],
                temperature=0.3,
                max_tokens=800,
                stream=True
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'type': 'content', 'delta': content})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            print("Translation Error:", e)
            yield f"data: {json.dumps({'type': 'content', 'delta': ' [Error connecting to Cosmic Oracle]'})}\n\n"
            yield "data: [DONE]\n\n"
            
    return Response(generate(), mimetype='text/event-stream')

@app.route('/tts', methods=['GET', 'POST'])
def generate_tts():
    try:
        import subprocess
        
        if request.method == "GET":
            text = request.args.get("text", "")
        else:
            data = request.json
            text = data.get("text", "")
            
        if not text:
            return jsonify({"error": "Text is required"}), 400
            
        # Sanitize text for TTS
        clean_text = text.replace('\n', ' ').replace('\r', '').replace('**', '').strip()
            
        print("Streaming TTS via Microsoft Edge Neural TTS...", flush=True)
        
        def generate():
            # Using Prabhat for a warm, majestic Indian-English neural voice
            # Set rate to +15% (1.15x speed) as requested
            cmd = [
                "edge-tts", 
                "--text", clean_text[:2000], 
                "--voice", "en-IN-PrabhatNeural", 
                "--rate", "+15%"
            ]
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            while True:
                chunk = process.stdout.read(4096)
                if not chunk:
                    break
                yield chunk
            process.stdout.close()
            process.wait()
            
        return Response(stream_with_context(generate()), mimetype="audio/mpeg")
    except Exception as e:
        print(f"TTS Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🌐 Open http://localhost:5001 in your browser\n")
    app.run(debug=False, port=5001)
