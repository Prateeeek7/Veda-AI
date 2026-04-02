import Link from "next/link";
import Image from "next/image";
import { getGeetaData, getMahabharataData, getRamayanaData, getRamcharitmanas, CHAPTER_NAMES, KANDA_NAMES, RCM_KANDA_NAMES } from "@/lib/db";
import { Book, ChevronRight, ScrollText, Feather, Sparkles } from "lucide-react";
import VerseCard from "@/components/VerseCard";
import ChapterPagination from "@/components/ChapterPagination";

const PARVA_NAMES = [
  "Adi Parva", "Sabha Parva", "Vana Parva", "Virata Parva", "Udyoga Parva",
  "Bhishma Parva", "Drona Parva", "Karna Parva", "Shalya Parva", "Sauptika Parva",
  "Stri Parva", "Shanti Parva", "Anushasana Parva", "Ashvamedhika Parva",
  "Ashramavasika Parva", "Mausala Parva", "Mahaprasthanika Parva", "Svargarohana Parva"
];

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ book?: string, parva?: string, kanda?: string, chapter?: string }> }) {
  const params = await searchParams;
  
  // If no book is selected, show the unified Library Catalog Dashboard
  if (!params.book) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full z-10 flex flex-col items-center">
        <h1 className="font-cinzel text-4xl md:text-6xl text-gold mb-6 drop-shadow-md text-center">
          Sacred Texts Library
        </h1>
        <p className="text-xl md:text-2xl font-light text-saffron/80 text-center mb-16 max-w-2xl">
          Immerse yourself in the divine wisdom of the ancients. Choose a scripture to begin your journey.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Bhagavad Gita Card */}
          <Link href="/library?book=gita&chapter=1" className="group glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] border border-white/5 hover:border-gold/50 flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-black/50 z-0 transition-opacity group-hover:bg-black/40 duration-700"></div>
            <Image src="/images/bg_gita.png" alt="Bhagavad Gita" fill className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
            <div className="relative z-10 flex flex-col items-center h-full">
              <Book className="w-16 h-16 text-gold mb-6 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            <h2 className="font-cinzel text-3xl text-white mb-4 group-hover:text-gold transition-colors">Bhagavad Gita</h2>
            <p className="text-muted font-light leading-relaxed mb-6">
              The Song of the Lord. A 700-verse Hindu scripture that is part of the epic Mahabharata, containing the divine discourse between Prince Arjuna and Lord Krishna.
            </p>
            <div className="flex items-center gap-2 mb-8 mt-auto">
               <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-cinzel tracking-widest uppercase flex items-center gap-2">
                 ⚡️ AI Insight Enabled
               </span>
            </div>
            <span className="font-cinzel text-gold text-sm tracking-widest uppercase border-b border-gold/30 pb-1 group-hover:border-gold transition-all relative z-10">
              Enter Scripture &rarr;
            </span>
            </div>
          </Link>

          {/* Mahabharata Card */}
          <Link href="/library?book=mahabharata&parva=1&chapter=1" className="group glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,153,51,0.2)] border border-white/5 hover:border-saffron/50 flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-black/50 z-0 transition-opacity group-hover:bg-black/40 duration-700"></div>
            <Image src="/images/bg_mahabharata.png" alt="Mahabharata" fill className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-saffron/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
            <div className="relative z-10 flex flex-col items-center h-full">
              <ScrollText className="w-16 h-16 text-saffron mb-6 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(255,153,51,0.5)]" />
            <h2 className="font-cinzel text-3xl text-white mb-4 group-hover:text-saffron transition-colors">Mahabharata</h2>
            <p className="text-muted font-light leading-relaxed mb-6">
              The great epic of the Bharata Dynasty. A massive 73,000+ verse cosmic history encompassing philosophy, devotion, and the eternal struggle of Dharma.
            </p>
            <div className="flex items-center gap-2 mb-8 mt-auto">
               <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-cinzel tracking-widest uppercase flex items-center gap-2">
                 ⚡️ AI Translation Enabled
               </span>
            </div>
            <span className="font-cinzel text-saffron text-sm tracking-widest uppercase border-b border-saffron/30 pb-1 group-hover:border-saffron transition-all relative z-10">
              Enter Scripture &rarr;
            </span>
            </div>
          </Link>

          {/* Ramayana Card */}
          <Link href="/library?book=ramayana&kanda=1&chapter=1" className="group glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,102,102,0.2)] border border-white/5 hover:border-red-500/50 flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-black/50 z-0 transition-opacity group-hover:bg-black/40 duration-700"></div>
            <Image src="/images/bg_ramayana.png" alt="Valmiki Ramayana" fill className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
            <div className="relative z-10 flex flex-col items-center h-full">
              <Feather className="w-16 h-16 text-red-500 mb-6 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(255,102,102,0.5)]" />
            <h2 className="font-cinzel text-3xl text-white mb-4 group-hover:text-red-500 transition-colors">Valmiki Ramayana</h2>
            <p className="text-muted font-light leading-relaxed mb-6 max-w-xl">
              The Adi Kavya (First Poem). An epic 24,000-verse journey detailing the divine path of Maryada Purushottama Sri Rama, exploring ideals of duty, love, and cosmic order.
            </p>
            <div className="flex items-center gap-2 mb-8 mt-auto">
               <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-cinzel tracking-widest uppercase flex items-center gap-2">
                 ⚡️ AI Translation Enabled
               </span>
            </div>
            <span className="font-cinzel text-red-500 text-sm tracking-widest uppercase border-b border-red-500/30 pb-1 group-hover:border-red-500 transition-all relative z-10">
              Enter Scripture &rarr;
            </span>
            </div>
          </Link>

          {/* Ramcharitmanas Card */}
          <Link href="/library?book=rcm&kanda=1&chapter=1" className="group glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(147,112,219,0.3)] border border-white/5 hover:border-purple-400/50 flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-black/50 z-0 transition-opacity group-hover:bg-black/40 duration-700"></div>
            <Image src="/images/bg_ramcharitmanas.png" alt="Ramcharitmanas" fill className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
            <div className="relative z-10 flex flex-col items-center h-full">
              <Sparkles className="w-16 h-16 text-purple-400 mb-6 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(147,112,219,0.6)]" />
            <h2 className="font-cinzel text-3xl text-white mb-4 group-hover:text-purple-400 transition-colors">Ramacaritamanasa</h2>
            <p className="text-muted font-light leading-relaxed mb-6 max-w-xl">
              The Sacred Lake of Ram's Story. Tulsidas's immortal 12,000+ verse devotional masterpiece in Awadhi — celebrating the divine glory of Maryada Purushottama Sri Ram across 7 Kandas.
            </p>
            <div className="flex items-center gap-2 mb-8 mt-auto">
               <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-xs font-cinzel tracking-widest uppercase flex items-center gap-2">
                 ⚡️ Devanagari + Roman
               </span>
            </div>
            <span className="font-cinzel text-purple-400 text-sm tracking-widest uppercase border-b border-purple-400/30 pb-1 group-hover:border-purple-400 transition-all relative z-10">
              Enter Scripture &rarr;
            </span>
            </div>
          </Link>
        </div>
        <DivineFooter />
      </div>
    );
  }

  const selectedBook = params.book as string;
  const selectedChapter = params.chapter ? parseInt(params.chapter, 10) : 1;
  const selectedParva = params.parva ? parseInt(params.parva, 10) : 1;
  const selectedKanda = params.kanda ? parseInt(params.kanda, 10) : 1;

  let verses: any[] = [];
  let title = "";
  let subtitle = "";
  let totalChapters = 18;

  if (selectedBook === "gita") {
    const data = getGeetaData() || [];
    verses = data.filter((v: any) => v.chapter === selectedChapter);
    title = `Chapter ${selectedChapter}`;
    subtitle = CHAPTER_NAMES[selectedChapter - 1] || "";
    totalChapters = 18;
  } else if (selectedBook === "mahabharata") {
    const data = getMahabharataData();
    if (data && data[selectedParva]) {
      const parvaData = data[selectedParva];
      totalChapters = Object.keys(parvaData).length;
      const chStr = selectedChapter.toString();
      if (parvaData[chStr]) {
        verses = parvaData[chStr];
      } else {
        const availableChs = Object.keys(parvaData).map(Number).sort((a,b)=>a-b);
        if (availableChs.length > 0) verses = parvaData[availableChs[0].toString()];
      }
    }
    title = `${PARVA_NAMES[selectedParva - 1]}`;
    subtitle = `Chapter ${selectedChapter}`;
  } else if (selectedBook === "ramayana") {
    const data = getRamayanaData() || [];
    // The ramayana JSON has kanda, sarga, shloka. We use `selectedChapter` as `sarga`.
    verses = data.filter((v: any) => v.kanda === selectedKanda && v.sarga === selectedChapter);
    title = `${KANDA_NAMES[selectedKanda - 1]}`;
    subtitle = `Sarga ${selectedChapter}`;
    
    // Find all unique Sargas in the selected Kanda to know the total chapters
    const kandaVerses = data.filter((v: any) => v.kanda === selectedKanda);
    const uniqueSargas = new Set(kandaVerses.map((v: any) => v.sarga));
    totalChapters = uniqueSargas.size;
  } else if (selectedBook === "rcm") {
    const data = getRamcharitmanas() || [];
    // rcm JSON has kanda, kanda_name, verse_num, type, text_roman, text_devanagari
    // We group by kanda; `selectedChapter` acts as verse-page (50 per page)
    const PAGE_SIZE = 50;
    const kandaVerses = data.filter((v: any) => v.kanda === selectedKanda);
    const start = (selectedChapter - 1) * PAGE_SIZE;
    verses = kandaVerses.slice(start, start + PAGE_SIZE);
    title = RCM_KANDA_NAMES[selectedKanda - 1] || `Kanda ${selectedKanda}`;
    subtitle = `Verses ${start + 1}–${Math.min(start + PAGE_SIZE, kandaVerses.length)}  of ${kandaVerses.length}`;
    totalChapters = Math.ceil(kandaVerses.length / PAGE_SIZE);
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto gap-4 md:gap-8 w-full z-10">
      
      {/* Return to Dashboard Button (Mobile flows naturally, Desktop positioned absolutely above main) */}
      <div className="w-full md:hidden mb-2">
        <Link href="/" className="text-gold/60 hover:text-gold transition-colors font-cinzel text-sm flex items-center gap-2 w-fit">
          <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> Return to Dashboard
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 glass-panel rounded-2xl p-4 md:p-6 h-fit md:sticky top-24 z-30">
        <div className="hidden md:flex items-center gap-3 mb-6 text-gold">
          <Book className="w-6 h-6" />
          <h2 className="font-cinzel text-xl font-bold">The Library</h2>
        </div>

        <div className="flex overflow-x-auto md:flex-col md:overflow-y-auto md:max-h-[60vh] gap-3 md:gap-2 pb-2 md:pb-0 pr-0 md:pr-2 custom-scrollbar whitespace-nowrap md:whitespace-normal items-center md:items-stretch mask-gradient-x md:mask-none">
          {selectedBook === "gita" ? (
            CHAPTER_NAMES.map((name, index) => {
              const chNum = index + 1;
              const isActive = chNum === selectedChapter;
              return (
                  <Link 
                    key={chNum} 
                    href={`/library?book=gita&chapter=${chNum}`}
                    className={`block p-2 px-4 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm transition-all shadow-sm flex-shrink-0
                      ${isActive 
                        ? 'bg-gold/20 border border-gold text-white font-medium shadow-[0_0_15px_rgba(255,215,0,0.2)]' 
                        : 'bg-white/5 border border-white/5 text-muted hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="text-gold mr-2 font-cinzel">CH {chNum}</span>
                    <span className="hidden md:inline">{name.split(" - ")[1]}</span>
                  </Link>
              )
            })
          ) : selectedBook === "mahabharata" ? (
            PARVA_NAMES.map((name, index) => {
              const pNum = index + 1;
              const isActive = pNum === selectedParva;
              return (
                  <Link 
                    key={pNum} 
                    href={`/library?book=mahabharata&parva=${pNum}&chapter=1`}
                    className={`block p-2 px-4 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm transition-all shadow-sm flex-shrink-0
                      ${isActive 
                        ? 'bg-gold/20 border border-gold text-white font-medium shadow-[0_0_15px_rgba(255,215,0,0.2)]' 
                        : 'bg-white/5 border border-white/5 text-muted hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="text-gold mr-2 font-cinzel">PR {pNum}</span>
                    <span className="hidden md:inline">{name.split(" - ")[1]}</span>
                  </Link>
              )
            })
          ) : selectedBook === "ramayana" ? (
            KANDA_NAMES.map((name, index) => {
              const kNum = index + 1;
              const isActive = kNum === selectedKanda;
              return (
                  <Link 
                    key={kNum} 
                    href={`/library?book=ramayana&kanda=${kNum}&chapter=1`}
                    className={`block p-2 px-4 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm transition-all shadow-sm flex-shrink-0
                      ${isActive 
                        ? 'bg-red-500/20 border border-red-500/50 text-white font-medium shadow-[0_0_15px_rgba(255,102,102,0.2)]' 
                        : 'bg-white/5 border border-white/5 text-muted hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="font-cinzel">{name.includes(" - ") ? name.split(" - ")[1] : name}</span>
                  </Link>
              )
            })
          ) : selectedBook === "rcm" ? (
            RCM_KANDA_NAMES.map((name, index) => {
              const kNum = index + 1;
              const isActive = kNum === selectedKanda;
              return (
                  <Link 
                    key={kNum} 
                    href={`/library?book=rcm&kanda=${kNum}&chapter=1`}
                    className={`block p-2 px-4 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm transition-all shadow-sm flex-shrink-0
                      ${isActive 
                        ? 'bg-purple-500/20 border border-purple-400/50 text-white font-medium shadow-[0_0_15px_rgba(147,112,219,0.2)]' 
                        : 'bg-white/5 border border-white/5 text-muted hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="font-cinzel text-purple-300">{name.includes(" - ") ? name.split(" - ")[0] : name}</span>
                  </Link>
              )
            })
          ) : (
            KANDA_NAMES.map((name, index) => {
              const kNum = index + 1;
              const isActive = kNum === selectedKanda;
              return (
                  <Link 
                    key={kNum} 
                    href={`/library?book=ramayana&kanda=${kNum}&chapter=1`}
                    className={`block p-2 px-4 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm transition-all shadow-sm flex-shrink-0
                      ${isActive 
                        ? 'bg-red-500/20 border border-red-500/50 text-white font-medium shadow-[0_0_15px_rgba(255,102,102,0.2)]' 
                        : 'bg-white/5 border border-white/5 text-muted hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="font-cinzel text-red-300">{name.includes(" - ") ? name.split(" - ")[0] : name}</span>
                  </Link>
              )
            })
          )}
        </div>
      </aside>

      {/* Main Reading Area */}
      <main className="flex-1 space-y-12 pb-20">
        <header className="mb-12 border-b border-white/10 pb-8 relative">
          <Link href="/" className="hidden md:flex absolute -top-6 left-0 text-gold/60 hover:text-gold transition-colors font-cinzel text-sm items-center gap-2">
            &larr; Return to Dashboard
          </Link>
          <h1 className="font-cinzel text-2xl md:text-5xl text-gold mb-4 drop-shadow-md pt-6">
            {title}
          </h1>
          <p className="text-lg md:text-2xl font-light text-saffron tracking-wide">
            {subtitle}
          </p>

          {/* Chapter Pagination for Epics */}
          {(selectedBook === "mahabharata" || selectedBook === "ramayana" || selectedBook === "rcm") && totalChapters > 0 && (
            <ChapterPagination 
              book={selectedBook} 
              current={selectedChapter} 
              total={totalChapters} 
              sectionId={selectedBook === "ramayana" || selectedBook === "rcm" ? selectedKanda : selectedParva} 
            />
          )}
        </header>

        {verses.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl">
            <ScrollText className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <p className="text-xl text-white/50 font-cinzel">No verses found for this chapter.</p>
          </div>
        ) : (
          verses.map((verse: any, idx: number) => (
            <VerseCard 
              key={`${verse.verse}-${idx}`} 
              verse={verse} 
              selectedBook={selectedBook} 
              chapterInfo={{ chapter: selectedChapter, parva: selectedParva }} 
            />
          ))
        )}

        {/* Bottom Pagination Footer */}
        {totalChapters > 0 && (
          <div className="flex justify-center md:justify-end items-center pt-8 border-t border-glass-border">
            <ChapterPagination 
              book={selectedBook} 
              current={selectedChapter} 
              total={totalChapters} 
              sectionId={selectedBook === "ramayana" || selectedBook === "rcm" ? selectedKanda : selectedParva} 
            />
          </div>
        )}
        
        <DivineFooter />
      </main>

    </div>
  );
}

function DivineFooter() {
  return (
    <footer className="w-full mt-24 mb-6 border-t border-gold/20 pt-16 pb-12 flex flex-col items-center text-center relative overflow-hidden rounded-3xl glass-panel">
      {/* Subtle divine background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gold/5 pointer-events-none"></div>
      
      <Sparkles className="w-8 h-8 text-gold mb-6 opacity-80 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
      
      <h3 className="font-cinzel text-xl md:text-3xl text-gold mb-4 tracking-widest uppercase">
        Veda AI
      </h3>
      
      <p className="max-w-3xl text-saffron/80 font-light text-xs md:text-base leading-relaxed mb-8 px-6">
        "Whenever there is a decline in righteousness, O Arjuna, and an increase in unrighteousness, then I manifest Myself." <br className="hidden md:block"/>
        <span className="italic mt-2 block text-white/50">— Bhagavad Gita 4.7</span>
      </p>

      <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-8"></div>

      <div className="max-w-4xl text-muted/70 font-outfit text-sm leading-relaxed px-6 space-y-4 relative z-10">
        <p>
          <strong className="text-gold/80 font-cinzel tracking-widest">ABOUT THIS PORTAL</strong><br/>
          Veda AI is a sacred sanctuary blending ancient Vedic wisdom with cutting-edge artificial intelligence. 
          Built with an unwavering dedication to accuracy, the Cosmic Oracle strictly references authentic scriptural databases including the Bhagavad Gita, Mahabharata, and Valmiki Ramayana.
        </p>
        <p>
          Experience hyper-realistic neural voice synthesis, context-aware translations, and philosophical insights without hallucination. 
          May this digital ashram guide your cosmic journey toward Dharma and self-realization.
        </p>
      </div>

      <div className="mt-12 text-xs font-cinzel text-gold/40 tracking-widest uppercase relative z-10">
        Awakened in 2026 • Devoted to Truth
      </div>
    </footer>
  );
}
