
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchKLWeather } from './services/weatherService';
import { getDailyContent } from './services/geminiService';
import { FRUIT_THEMES } from './constants';
import { WeatherData } from './types';
import WeatherWidget from './components/WeatherWidget';
import IdiomSection from './components/IdiomSection';

interface Particle {
  id: number;
  left: string;
  duration: string;
  delay: string;
}

const App: React.FC = () => {
  const [displayedDate, setDisplayedDate] = useState<Date>(() => {
    const saved = localStorage.getItem('lastDisplayedDate');
    if (saved) return new Date(saved);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [dailyContent, setDailyContent] = useState<any>(null);
  const [isTearing, setIsTearing] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [isNewDay, setIsNewDay] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const particleIdRef = useRef(0);

  // Check if real-world time is ahead of displayed date to allow "Tear Off"
  useEffect(() => {
    const checkDate = () => {
      const realToday = new Date();
      realToday.setHours(0, 0, 0, 0);
      const displayed = new Date(displayedDate);
      displayed.setHours(0, 0, 0, 0);
      
      setIsNewDay(realToday.getTime() > displayed.getTime());
    };
    checkDate();
    const timer = setInterval(checkDate, 60000);
    return () => clearInterval(timer);
  }, [displayedDate]);

  const loadData = useCallback(async (date: Date) => {
    const [w, c] = await Promise.all([
      fetchKLWeather(),
      getDailyContent(date)
    ]);
    setWeather(w);
    setDailyContent(c);
  }, []);

  useEffect(() => {
    loadData(displayedDate);
  }, [displayedDate, loadData]);

  const viewDate = useMemo(() => {
    if (isPeeking) {
      const next = new Date(displayedDate);
      next.setDate(next.getDate() + 1);
      return next;
    }
    return displayedDate;
  }, [displayedDate, isPeeking]);

  const theme = useMemo(() => {
    const day = viewDate.getDate();
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const seed = day + month + year;
    return FRUIT_THEMES[seed % FRUIT_THEMES.length];
  }, [viewDate]);

  const handleAction = (e: React.MouseEvent) => {
    if (isTearing) return;

    if ((e.target as HTMLElement).closest('.emoji-trigger')) {
        return;
    }

    if (isNewDay) {
      setIsTearing(true);
      setIsPeeking(false);
      setTimeout(() => {
        const nextDate = new Date(displayedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(0,0,0,0);
        setDisplayedDate(nextDate);
        localStorage.setItem('lastDisplayedDate', nextDate.toISOString());
        setIsTearing(false);
      }, 800);
    } else {
      setIsPeeking(!isPeeking);
    }
  };

  const triggerFruitRain = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        left: `${Math.random() * 100}%`,
        duration: `${1.5 + Math.random() * 2}s`,
        delay: `${Math.random() * 0.5}s`,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 4000);
  };

  const dayName = viewDate.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long' });
  const dayNum = viewDate.getDate();
  const year = viewDate.getFullYear();

  return (
    <div className={`min-h-screen ${theme.color} flex flex-col items-center justify-center p-4 transition-colors duration-700 overflow-hidden`}>
      
      {particles.map(p => (
        <div 
          key={p.id} 
          className="fruit-particle" 
          style={{ 
            left: p.left, 
            '--duration': p.duration, 
            animationDelay: p.delay 
          } as any}
        >
          {theme.emoji}
        </div>
      ))}

      <div className="relative w-full max-w-sm h-[680px] perspective-1000 z-10">
        <div 
          onClick={handleAction}
          className={`
            relative w-full h-full bg-white rounded-[40px] border-2 ${theme.border} shadow-2xl flex flex-col items-center p-8 transition-all duration-500 cursor-pointer overflow-hidden
            ${isTearing ? '-translate-y-[120%] rotate-[-15deg] opacity-0' : 'translate-y-0'}
            ${isPeeking ? 'scale-[0.97] shadow-inner border-opacity-40' : 'hover:scale-[1.01] active:scale-[0.98]'}
          `}
        >
          {isPeeking && (
            <div className="absolute top-12 left-0 w-full z-20 pointer-events-none">
                <div className="mx-auto w-fit px-4 py-1 bg-gray-900/90 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">
                  Peeking into Tomorrow...
                </div>
            </div>
          )}

          {theme.isDurian && (
            <div className="absolute top-20 -right-8 rotate-45 z-20 pointer-events-none">
              <div className="bg-lime-500 text-white text-[10px] font-black px-10 py-1 shadow-lg border-y border-lime-600 uppercase tracking-tighter">
                Proud to be Malaysian 🇲🇾
              </div>
            </div>
          )}

          <div className="absolute top-4 w-full px-12 flex justify-between">
            <div className={`w-3 h-10 rounded-full border-2 ${theme.border} ${theme.color} shadow-inner`}></div>
            <div className={`w-3 h-10 rounded-full border-2 ${theme.border} ${theme.color} shadow-inner`}></div>
          </div>

          <div className="mt-10 w-full flex flex-col items-center flex-1">
            <div className={`text-center mb-4 transition-opacity duration-300 ${isPeeking ? 'opacity-60' : 'opacity-100'}`}>
              <span className={`text-sm font-bold uppercase tracking-[0.2em] ${theme.accent}`}>{monthName} {year}</span>
              <h1 className="text-8xl font-black text-gray-800 my-1 select-none tracking-tighter">{dayNum}</h1>
              <span className="text-lg text-gray-400 font-medium">{dayName}</span>
            </div>

            {/* Sub-header: Expanded Traditional Chinese Calendar Info */}
            <div className="mb-6 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 w-full max-w-[240px]">
              {isPeeking ? (
                <div className="text-center">
                  <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Content Locked 🔒</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Lunar</span>
                    <span className="text-[11px] text-gray-700 font-black">{dailyContent?.lunarInfo?.lunarDateStr || "Loading..."}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 italic">{dailyContent?.lunarInfo?.stemsBranches}</span>
                    <span className="text-xs">{dailyContent?.lunarInfo?.zodiac}</span>
                  </div>
                  {(dailyContent?.lunarInfo?.solarTerm || dailyContent?.lunarInfo?.festival) && (
                    <div className="mt-1 flex gap-1.5 flex-wrap justify-center">
                      {dailyContent?.lunarInfo?.solarTerm && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                          {dailyContent.lunarInfo.solarTerm}
                        </span>
                      )}
                      {dailyContent?.lunarInfo?.festival && (
                        <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                          {dailyContent.lunarInfo.festival}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <WeatherWidget weather={weather} accentClass={theme.accent} />

            <div className="mt-auto w-full pb-2">
              {!isPeeking ? (
                <IdiomSection idiom={dailyContent?.idiom} />
              ) : (
                <div className="mt-6 text-center px-6">
                  <div className="inline-block px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-4">
                    Tomorrow's Mystery
                  </div>
                  <div className="space-y-2 opacity-20">
                    <div className="h-4 bg-gray-200 rounded-full w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-2/3 mx-auto animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div 
            onClick={triggerFruitRain}
            className="emoji-trigger absolute bottom-6 left-6 text-5xl hover:scale-125 active:scale-90 transition-transform duration-300 cursor-pointer z-30 drop-shadow-md"
            title="Tap for fruit rain!"
          >
            {theme.emoji}
          </div>

          {isNewDay && !isPeeking && (
            <div className="absolute top-0 w-full h-1 text-center pointer-events-none">
               <div className="animate-bounce mt-2 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-white/80 py-1 px-4 mx-auto rounded-full w-fit border border-gray-100 shadow-sm">
                  Tear Me ↓
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center px-4 z-20">
        {isNewDay ? (
          <div className={`text-xs ${theme.accent} font-bold animate-pulse bg-white/90 py-2.5 px-8 rounded-full shadow-lg border-2 ${theme.border}`}>
            A new day has arrived! Tear it off! ✨
          </div>
        ) : (
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/50 py-2 px-6 rounded-full backdrop-blur-sm shadow-sm border border-white/40">
            {isPeeking ? "Release to go back" : "Tap anywhere to peek at tomorrow 👁️"}
          </div>
        )}
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-[0.05] flex flex-wrap justify-around items-center p-20 z-0 overflow-hidden">
         {Array.from({length: 12}).map((_, i) => (
           <span key={i} className={`text-8xl m-8 transition-transform duration-1000 ${isPeeking ? 'scale-150 rotate-90 blur-sm' : 'scale-100'}`}>
             {theme.emoji}
           </span>
         ))}
      </div>
    </div>
  );
};

export default App;
