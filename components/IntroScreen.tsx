'use client';

import { translations, Locale } from '../lib/translations';
import FloatingHearts from './FloatingHearts';

interface IntroScreenProps {
  onStart: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export default function IntroScreen({ onStart, locale, setLocale, isDarkMode, setIsDarkMode }: IntroScreenProps) {
  const t = translations[locale].introScreen;

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-500 relative overflow-hidden font-sans ${isDarkMode ? 'bg-slate-950' : 'bg-theme-50'}`}>
      <FloatingHearts />
      
      {/* Background Decorative Elements */}
      <div className={`absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] animate-blob ${isDarkMode ? 'bg-pink-900/20' : 'bg-theme-400/20'}`}></div>
      <div className={`absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-400/20'}`}></div>

      {/* Navbar */}
      <nav className="w-full flex items-center justify-between p-6 lg:px-12 relative z-20">
        <div className="flex items-center gap-2">
          {/* <div className="w-10 h-10 bg-theme-500 rounded-xl flex items-center justify-center shadow-lg shadow-theme-200/50">
            <span className="text-xl text-white">💖</span>
          </div> */}
          <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>LoveTracker</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`hidden sm:flex items-center backdrop-blur-md p-1 rounded-full border shadow-sm ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-theme-100'}`}>
            <button onClick={() => setLocale('vi')} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${locale === 'vi' ? (isDarkMode ? 'bg-pink-900/50 scale-105 shadow-sm' : 'bg-theme-100 scale-105 shadow-sm') : (isDarkMode ? 'hover:bg-slate-700 opacity-60 grayscale' : 'hover:bg-theme-50 opacity-60 grayscale')}`}>
              <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="w-4 h-auto rounded-[2px]" />
            </button>
            <button onClick={() => setLocale('en')} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${locale === 'en' ? (isDarkMode ? 'bg-pink-900/50 scale-105 shadow-sm' : 'bg-theme-100 scale-105 shadow-sm') : (isDarkMode ? 'hover:bg-slate-700 opacity-60 grayscale' : 'hover:bg-theme-50 opacity-60 grayscale')}`}>
              <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-4 h-auto rounded-[2px]" />
            </button>
          </div>

          <button 
            onClick={() => {
              const newMode = !isDarkMode;
              setIsDarkMode(newMode);
              localStorage.setItem('theme', newMode ? 'dark' : 'light');
              if (newMode) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            }}
            className={`w-10 h-10 rounded-full backdrop-blur-md border shadow-sm flex items-center justify-center hover:scale-105 transition-all ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white/80 border-theme-100 text-theme-600'}`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* <button 
            onClick={onStart}
            className={`px-5 sm:px-6 py-2.5 rounded-full font-bold text-sm shadow-sm border hover:shadow-md transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-theme-600 border-theme-100'}`}
          >
            {t.loginBtn}
          </button> */}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 p-6 lg:px-12 max-w-7xl mx-auto w-full relative z-10 mt-6 lg:mt-0">
        
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
          {/* <div className={`inline-block px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md ${isDarkMode ? 'bg-pink-900/30 border-pink-800 text-pink-400' : 'bg-theme-100/50 border-theme-200 text-theme-600'}`}>
            {t.versionTag}
          </div> */}
          
          <h1 className={`text-5xl lg:text-7xl font-black leading-[1.1] mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {t.titleLine1} <br />
            <span className="text-theme-500">{t.titleLine2}</span>
          </h1>
          
          <p className={`text-base lg:text-lg mb-10 max-w-lg font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {t.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={onStart}
              className="btn-cute px-8 py-4 rounded-full font-black text-sm shadow-[0_8px_25px_-5px_rgba(236,72,153,0.5)] hover:shadow-[0_15px_35px_-5px_rgba(236,72,153,0.6)] hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-wider"
            >
              {t.startBtn}
            </button>
            <button 
              onClick={() => window.open('https://github.com', '_blank')}
              className={`px-8 py-4 rounded-full font-bold text-sm shadow-sm border transition-all active:scale-95 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-theme-600 border-theme-100 hover:bg-theme-50'}`}
            >
              <svg className="w-5 h-5 text-theme-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              {t.githubBtn}
            </button>
          </div>
        </div>

        {/* Mockup bên phải */}
        <div className="flex-1 w-full max-w-md relative hidden md:block">
          <div className={`relative backdrop-blur-2xl border p-6 rounded-[2.5rem] shadow-2xl z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 ${isDarkMode ? 'bg-slate-900/40 border-slate-700/50 shadow-pink-900/10' : 'bg-white/60 border-white shadow-theme-900/10'}`}>
            <div className={`flex justify-between items-center mb-8 border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-theme-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full border-2 shadow-sm ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-theme-100 border-white'}`}></div>
                <div className={`w-12 h-12 rounded-full border-2 shadow-sm -ml-4 ${isDarkMode ? 'bg-pink-900/50 border-slate-600' : 'bg-theme-200 border-white'}`}></div>
              </div>
              <div className={`w-24 h-8 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-theme-50'}`}></div>
            </div>
            
            <div className={`rounded-3xl p-6 text-center shadow-sm border mb-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-theme-50'}`}>
              <div className="text-[10px] font-bold text-theme-400 uppercase tracking-widest mb-2">{t.daysTogether}</div>
              <div className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>365 <span className="text-xl text-theme-500">{t.days}</span></div>
            </div>
            
            <div className="flex gap-2">
               <div className={`h-12 flex-1 rounded-2xl ${isDarkMode ? 'bg-pink-900/30' : 'bg-theme-100'}`}></div>
               <div className={`h-12 flex-1 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-theme-50'}`}></div>
               <div className={`h-12 flex-1 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-theme-50'}`}></div>
            </div>
          </div>
          
          <div className={`absolute -bottom-10 -left-10 backdrop-blur-xl p-5 rounded-3xl shadow-xl border z-20 animate-bounce ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white/90 border-white/50'}`} style={{ animationDuration: '3s' }}>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-theme-100 text-theme-500 rounded-full flex items-center justify-center text-lg">📸</div>
                <div>
                   <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t.newMemory}</div>
                   <div className="text-[10px] text-slate-500">{t.justUploaded}</div>
                </div>
             </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}