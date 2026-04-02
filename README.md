# ॐ Veda AI (GeetaAI)

Veda AI is a "Cosmic Guidance Portal"—a fully decoupled, futuristic web application that acts as an interactive digital ashram. It houses a massive, highly structured sacred text library containing the Bhagavad Gita, Valmiki Ramayana, Mahabharata, and Tulsidas Ramcharitmanas.

Beyond just a reading application, Veda AI features a real-time, RAG-powered Artificial Intelligence oracle that can contextually translate ancient Sanskrit verses, provide profound philosophical meaning, stream responses, and synthesize hyper-realistic vocal recitations with zero latency.

## Architecture & Tech Stack

Veda AI separates its heavy AI logic from its seamless user interface into two distinct layers:

### 1. The React / Next.js Frontend
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS, Glassmorpism UI, dedicated responsive CSS variable tokens (`gold`, `saffron`, `midnight-blue`)
- **Animation:** Framer Motion for page layout transitions and GSAP for geometric landing page animations.
- **Audio Engine:** HTML5 chunked audio streaming mapped to native browser buffers for instantaneous text-to-speech.

### 2. The Python / Flask Oracle Backend
- **Server:** Flask (serving as a JSON API Proxy)
- **Vector Engine:** FAISS for storing, searching, and rapidly retrieving the massive epic databases in-memory.
- **AI Brain:** `groq` wrapper piping into `llama-3.3-70b-versatile` for blazing-fast meaning synthesis and conversational queries.
- **Voice Synthesis:** `edge-tts` (Microsoft Azure Neural TTS) generating pure binary stream fragments piped directly to HTTP stdout.

## Features

- 🌌 **The Cosmic Library:** Explore 100,000+ perfectly indexed verses across 4 legendary epics via a custom UI featuring scalable Devanagari text rendering and interactive jump-pagination.
- ✨ **Divine Insight (Live Translations):** Click "Enlighten Me" on any raw Sanskrit verse to trigger the Oracle. The backend will inject the context and instantly stream a bespoke English translation combined with profound spiritual context.
- 🗣️ **Zero-Latency Neural Voice:** Click "Listen" to have the verse's meaning read to you via high-fidelity, real-time streamed Indian-English text-to-speech (en-IN-PrabhatNeural).
- 📱 **Mobile Optimized:** 100% horizontally responsive layout optimizing density on mobile layouts with dynamic pill-scrollers and precise viewport typography.

## Setup & Execution

### Prerequisites
- Node.js & npm (for the Next.js frontend)
- Python 3.10+ (for the Flask backend)
- A free API key from [Groq](https://console.groq.com/keys)

### Initial Configuration
1. Obtain your Groq API key.
2. In your terminal environment, export it so the backend can detect it:
   ```bash
   export GROQ_API_KEY="your-groq-api-key-here"
   ```

### Running the Application

For a fully automated boot sequence, simply run the integrated start script from the root directory:

```bash
chmod +x start.sh
./start.sh
```

This will automatically launch the Oracle Backend on **Port 5001** and the Next.js Frontend on **Port 3000**, and will cleanly shut down both servers together upon exit (Ctrl+C).

Navigate your browser to `http://localhost:3000` to begin your journey.
