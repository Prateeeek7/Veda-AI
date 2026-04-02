'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChapterPagination({ 
  book, 
  current, 
  total, 
  sectionId 
}: { 
  book: string, 
  current: number, 
  total: number, 
  sectionId: number 
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(current.toString());

  const getLabel = () => {
    if (book === "ramayana") return "Sarga";
    if (book === "rcm") return "Page";
    return "Chapter";
  };

  const getUrl = (target: number) => {
    if (book === "gita") return `/library?book=gita&chapter=${target}`;
    if (book === "ramayana" || book === "rcm") return `/library?book=${book}&kanda=${sectionId}&chapter=${target}`;
    return `/library?book=${book}&parva=${sectionId}&chapter=${target}`;
  };

  const handleGo = () => {
    const target = parseInt(inputValue, 10);
    if (!isNaN(target) && target >= 1 && target <= total) {
      if (target !== current) {
        router.push(getUrl(target));
      }
    } else {
      setInputValue(current.toString()); // revert on invalid string
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGo();
    if (e.key === 'Escape') {
      setInputValue(current.toString());
      setIsEditing(false);
    }
  };

  const colorClass = book === 'ramayana' ? 'text-red-500' : book === 'rcm' ? 'text-purple-400' : 'text-gold';
  const borderClass = book === 'ramayana' ? 'border-red-500/20' : book === 'rcm' ? 'border-purple-400/20' : 'border-gold/20';
  const hoverClass = book === 'ramayana' ? 'hover:bg-red-500/20' : book === 'rcm' ? 'hover:bg-purple-500/20' : 'hover:bg-gold/20';

  return (
    <div className={`flex items-center justify-center gap-3 mt-4 md:mt-8 bg-black/30 p-1.5 px-3 md:p-3 md:px-4 rounded-xl w-fit border mx-auto md:mx-0 shadow-sm ${borderClass}`}>
      <button 
        onClick={() => current > 1 && router.push(getUrl(current - 1))}
        disabled={current <= 1}
        className={`p-1.5 md:p-2 rounded-lg transition-colors ${current > 1 ? hoverClass + ' ' + colorClass : 'text-white/10'}`}
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
      </button>

      {isEditing ? (
        <div className="flex items-center gap-1 md:gap-2">
          <span className="font-cinzel text-xs md:text-base text-white/50 hidden md:inline">{getLabel()}</span>
          <input 
            type="number" 
            min={1} 
            max={total} 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleGo}
            autoFocus
            className={`w-14 md:w-16 bg-white/5 border ${borderClass} rounded text-center font-cinzel text-sm md:text-base text-white outline-none focus:border-white/50 p-1`}
          />
          <span className="font-cinzel text-xs md:text-base text-white/50">/ {total}</span>
        </div>
      ) : (
        <span 
          onClick={() => setIsEditing(true)}
          className="font-cinzel tracking-widest font-semibold text-white/80 text-xs md:text-base cursor-pointer hover:text-white transition-colors"
          title={`Click to jump to a specific ${getLabel().toLowerCase()}`}
        >
          {getLabel().toUpperCase()} {current} <span className="opacity-50">/ {total}</span>
        </span>
      )}

      <button 
        onClick={() => current < total && router.push(getUrl(current + 1))}
        disabled={current >= total}
        className={`p-1.5 md:p-2 rounded-lg transition-colors ${current < total ? hoverClass + ' ' + colorClass : 'text-white/10'}`}
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );
}
