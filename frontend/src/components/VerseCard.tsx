"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Volume2, Square, Loader2 } from "lucide-react";

export default function VerseCard({ verse, selectedBook, chapterInfo }: { verse: any, selectedBook: string, chapterInfo: { chapter?: number, parva?: number, kanda?: number } }) {
  const [insight, setInsight] = useState<{ text: string, loading: boolean } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handleSpeak = async () => {
    if (!insight) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // If we already generated the audio, just resume it
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    const cleanText = insight.text
      .replace(/###\s*(.+)/g, '$1... ') // Add a natural pause for the TTS engine
      .replace(/\*\*/g, ''); // Remove markdown for speech
    setIsAudioLoading(true);

    try {
      const url = `/api/tts?text=${encodeURIComponent(cleanText)}`;
      const audio = new window.Audio(url);
      
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      
      // We no longer wait for a full blob download block, stream starts immediately!
      setIsAudioLoading(false);
      setIsPlaying(true);
      audio.play().catch(e => {
        console.error("Audio playback error:", e);
        setIsAudioLoading(false);
        setIsPlaying(false);
      });
    } catch (e) {
      console.error(e);
      setIsAudioLoading(false);
      setIsPlaying(false);
    }
  };

  const verseNumber = verse.verse || verse.shloka || verse.verse_num || 1;
  const verseKey = `${chapterInfo.chapter || verse.sarga || verse.kanda}-${verseNumber}`;

  // Unified field resolution across all scripture schemas
  const devanagariText = verse.text_devanagari || verse.sanskrit || verse.text || "";
  const romanText = verse.text_roman || verse.transliteration || "";
  const verseType = verse.type || null; // 'doha' | 'chaupai' | 'shloka' — RCM only

  const handleTranslate = async () => {
    if (insight) return; // Prevent multiple clicks
    setInsight({ text: "", loading: true });

    try {
      let ctxString = `Mahabharata Verse ${verseNumber}`;
      if (selectedBook === "gita") {
        ctxString = `Bhagavad Gita Chapter ${chapterInfo.chapter}, Verse ${verseNumber}`;
      } else if (selectedBook === "ramayana") {
        ctxString = `Valmiki Ramayana Kanda ${verse.kanda}, Sarga ${verse.sarga}, Shloka ${verse.shloka}`;
      } else if (selectedBook === "rcm") {
        ctxString = `Ramacaritamanasa (Tulsidas) ${verse.kanda_name}, Verse ${verseNumber} (${verseType || 'chaupai'})`;
      } else {
        ctxString = `Mahabharata Parva ${chapterInfo.parva}, Chapter ${chapterInfo.chapter}, Verse ${verseNumber}`;
      }

      const res = await fetch("/api/translate-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sanskrit: devanagariText || romanText,
          context: ctxString
        })
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let currentText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") break;
            try {
              const data = JSON.parse(dataStr);
              if (data.type === "content") {
                currentText += data.delta;
                setInsight({ text: currentText, loading: true });
              }
            } catch (e) {}
          }
        }
      }
      setInsight({ text: currentText, loading: false });
    } catch (e) {
      console.error(e);
      setInsight({ text: "The cosmic connection was interrupted. Please try again.", loading: false });
    }
  };

  return (
    <article className="glass-panel p-6 md:p-12 rounded-3xl relative overflow-hidden group">
      {/* Watermark Verse Number */}
      <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 text-7xl md:text-9xl font-cinzel text-white/[0.03] select-none pointer-events-none transition-transform group-hover:scale-110">
        {verseNumber}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
      <span className="text-gold mb-8 font-cinzel tracking-[0.2em] uppercase text-sm font-semibold border-b border-gold/30 pb-2 flex items-center gap-3">
          Verse {verseNumber}
          {verseType && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-cinzel tracking-widest capitalize ${
              verseType === 'doha' 
                ? 'border-purple-400/40 text-purple-300 bg-purple-500/10' 
                : 'border-saffron/30 text-saffron/70 bg-saffron/5'
            }`}>
              {verseType}
            </span>
          )}
        </span>
        
        {/* Devanagari Text */}
        {devanagariText && (
          <div className="font-yatra text-lg md:text-4xl text-white mb-6 leading-relaxed drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] max-w-2xl px-2 md:px-0">
            {devanagariText.split('|').map((line: string, i: number) => (
              <div key={i}>{line.trim()} {line.trim() !== '' ? '|' : ''}</div>
            ))}
          </div>
        )}

        {/* Transliteration / Roman Script */}
        {romanText && romanText !== devanagariText && (
          <div className="font-outfit text-base md:text-xl text-saffron/90 italic mb-10 max-w-2xl font-light">
             {romanText}
          </div>
        )}

        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-10"></div>

        {/* AI Meaning & Insight Area */}
        <div className="w-full flex flex-col items-center">
          {!insight ? (
            <button 
              onClick={handleTranslate}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold font-cinzel transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" /> Enlighten Me
            </button>
          ) : (
            <div className="mt-4 p-4 md:p-6 rounded-2xl bg-black/40 border border-saffron/20 w-full max-w-3xl text-left backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-3 border-b border-saffron/20 pb-3">
                <h4 className="text-sm font-cinzel text-saffron uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Divine Insight
                </h4>
                
                {!insight.loading && (
                  <button 
                    onClick={handleSpeak}
                    disabled={isAudioLoading}
                    className={`flex items-center justify-center gap-2 px-4 py-2 md:px-3 md:py-1.5 rounded-full text-xs font-cinzel transition-all border w-full md:w-auto ${
                      isPlaying 
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
                        : isAudioLoading
                        ? 'bg-gold/10 border-gold/30 text-gold/50 cursor-not-allowed'
                        : 'bg-saffron/10 border-saffron/30 text-saffron hover:bg-saffron/20'
                    }`}
                  >
                    {isAudioLoading ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Generating Veda Voice...</>
                    ) : isPlaying ? (
                      <><Square className="w-3 h-3 fill-current" /> Stop</>
                    ) : (
                      <><Volume2 className="w-3 h-3" /> Listen</>
                    )}
                  </button>
                )}
              </div>
              <div 
                className="text-base md:text-lg text-slate-200 font-light leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{__html: insight.text
                  .replace(/###\s*(.+)/g, '<h3 class="text-saffron font-cinzel text-xl mt-6 mb-2 tracking-widest uppercase">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold font-medium">$1</strong>')}}
              />
              {insight.loading && (
                 <span className="inline-block w-2 h-4 bg-gold ml-1 animate-pulse" />
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
