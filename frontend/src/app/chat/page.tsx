"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Mic, Square } from "lucide-react";
import gsap from "gsap";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: any[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "msg-0", role: "bot", text: "Namaste. I am Veda AI, grounded in the Bhagavad Gita. Seek your answers, and I shall unveil the sacred truths strictly from the text." }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  
  // Array to hold randomized star data uniquely generated on the Client to fix Hydration mismatch
  const [stars, setStars] = useState<Array<{id: number, top: string, left: string, delay: string, duration: string}>>([]);

  useEffect(() => {
    // Generate Stars Post-Mount
    setStars([...Array(40)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 3}s`
    })));

    // Fade in Background (No intrusive zooming)
    if (bgRef.current) {
      gsap.fromTo(
        bgRef.current,
        { opacity: 0 },
        { opacity: 0.25, duration: 4, ease: "power2.out" }
      );
    }
  }, []);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.text }))
        }),
      });
      
      if (!res.body) throw new Error("No streaming body received");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      const botMsgId = (Date.now() + 1).toString();
      let currentText = "";
      
      // Initialize empty bot message in the UI
      setMessages((prev) => [...prev, { id: botMsgId, role: "bot", text: "", sources: [] }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") {
                break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.type === "sources") {
                setMessages((prev) => prev.map(m => m.id === botMsgId ? { ...m, sources: data.sources } : m));
                setIsProcessing(false); // Stop "Awakening cosmic wisdom..." pulse when first byte arrives
              } else if (data.type === "content") {
                currentText += data.delta;
                setMessages((prev) => prev.map(m => m.id === botMsgId ? { ...m, text: currentText } : m));
              }
            } catch (e) {
              console.error("Parse error on stream chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "bot", text: "A disturbance in the cosmic connection occurred." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col pt-20 px-4 lg:px-12 z-10 w-full max-w-7xl mx-auto overflow-hidden">
      
      {/* Back Button */}
      <a href="/" className="absolute top-6 left-4 sm:left-12 text-gold/60 hover:text-gold transition-colors font-cinzel text-sm sm:text-base flex items-center gap-2 z-20">
        &larr; Return to Dashboard
      </a>

      {/* Static Full-Screen Graphic + Sparkling Overlay */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        .star { animation: twinkle 4s ease-in-out infinite; }
      `}} />
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none bg-bg-deep flex items-center justify-center">
        <div ref={bgRef} className="absolute inset-0 opacity-0 w-full h-full">
          <Image 
            src="/images/bg_krishna_chat.png" 
            alt="Cosmic Krishna" 
            fill 
            className="object-cover object-[center_20%] opacity-100 mix-blend-screen"
            priority
          />
        </div>
        
        {/* Dynamic Sparkles Array */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div 
              key={star.id}
              className="star absolute w-1 h-1 bg-white rounded-full opacity-0 shadow-[0_0_8px_2px_rgba(255,255,255,0.4)]"
              style={{
                top: star.top,
                left: star.left,
                animationDelay: star.delay,
                animationDuration: star.duration
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-transparent to-bg-deep opacity-80" />
      </div>

      {/* Header */}
      <div className="flex-shrink-0 text-center mb-8 relative z-10 pt-4">
        <h1 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-gold to-saffron drop-shadow-md">
          Veda AI
        </h1>
        <p className="text-muted/80 font-light tracking-wide text-sm mt-1">Cosmic Guidance Portal</p>
      </div>

      {/* Chat Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-2 sm:px-6 space-y-6 pb-36">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div 
              className={`glass-panel p-5 sm:p-6 rounded-2xl max-w-[95%] sm:max-w-[85%] shadow-xl border-t
                ${msg.role === "user" 
                  ? "border-t-blue-400 bg-blue-900/10 rounded-tr-sm" 
                  : "border-t-gold bg-black/60 rounded-tl-sm"}`}
            >
                <div 
                  className={`text-base sm:text-lg leading-relaxed font-light whitespace-pre-wrap ${msg.role === "user" ? "text-blue-50" : "text-slate-100"}`}
                  dangerouslySetInnerHTML={{__html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold font-medium">$1</strong>')}}
                />
                
                {/* Sources Accordion */}
                {msg.sources && msg.sources.length > 0 && (
                  <details className="mt-6 bg-black/50 p-4 sm:p-6 rounded-xl border border-gold/20 group transition-all">
                    <summary className="cursor-pointer font-cinzel text-gold text-sm sm:text-base font-semibold flex items-center gap-3 outline-none hover:text-saffron transition-colors">
                      <span className="group-open:rotate-90 transition-transform">▶</span> Exploring Sacred Sources ({msg.sources.length})
                    </summary>
                    <div className="mt-6 space-y-8">
                      {msg.sources.map((s: any, i: number) => {
                        const sanskritLines = s.sanskrit ? s.sanskrit.split('|') : [];
                        return (
                          <div key={i} className="pb-6 border-b border-white/5 last:border-0 last:pb-0">
                            <div className="text-saffron font-cinzel text-sm tracking-widest mb-4 inline-block border-b border-saffron/30 pb-1">
                              BG {s.chapter}.{s.verse} &mdash; {s.chapter_name}
                            </div>
                            
                            <div className="font-yatra text-lg sm:text-xl text-white mb-3 text-left leading-relaxed drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                              {sanskritLines.map((line: string, idx: number) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;
                                return <div key={idx}>{trimmed} {idx < sanskritLines.length - 1 ? '|' : ''}</div>;
                              })}
                            </div>
                            
                            <div className="text-muted/90 italic text-sm sm:text-base text-left font-light leading-relaxed border-l-2 border-white/10 pl-4">
                              "{s.translation}"
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                )}
              </div>
          </div>
        ))}
        {isProcessing && (
          <div className="glass-panel p-5 rounded-2xl border-t border-t-saffron w-fit text-saffron font-cinzel text-base animate-pulse flex items-center gap-3">
            <SparklesIcon className="w-5 h-5" /> Awakening cosmic wisdom...
          </div>
        )}
        <div ref={messagesEndRef} className="h-8" />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-t from-bg-deep via-bg-deep/90 to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4 h-16 bg-glass-bg backdrop-blur-2xl border border-glass-border shadow-[0_0_30px_rgba(212,175,55,0.1)] rounded-full items-center pl-6 sm:pl-8 pr-2 pointer-events-auto">
          
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Seek wisdom from the Gita..."
            disabled={isProcessing}
            className="flex-1 bg-transparent text-white outline-none placeholder:text-muted/50 placeholder:font-cinzel text-base sm:text-lg font-light disabled:opacity-50"
          />
          
          <button 
            className="p-3 text-gold hover:text-saffron transition-colors rounded-full relative group hidden sm:flex"
            title="Voice Input (Coming Soon)"
            onClick={() => alert('Voice integration would be bound here using react-speech-recognition.')}
          >
            <div className="absolute inset-0 border border-gold rounded-full opacity-0 group-hover:animate-[ping_1.5s_infinite]" />
            <Mic className="w-6 h-6 relative z-10" />
          </button>
          
          <button 
            onClick={isProcessing ? undefined : handleSend}
            disabled={isProcessing || !input.trim()}
            className="p-3 sm:p-4 bg-gold hover:bg-gold/90 text-bg-deep rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg"
          >
            {isProcessing ? <Square className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Send className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
          
        </div>
      </div>

    </div>
  );
}

// Inline Sparkles Icon to avoid extra imports if not present
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}
