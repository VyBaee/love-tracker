'use client';

import { useState, useEffect } from 'react';
import { translations, Locale } from '../lib/translations';
import FloatingHearts from './FloatingHearts';
import Auth from './Auth';

interface IntroScreenProps {
  showAuth: boolean;
  onStart: () => void;
  onBack: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export default function IntroScreen({ showAuth, onStart, onBack, locale, setLocale, isDarkMode, setIsDarkMode }: IntroScreenProps) {
  const t = translations[locale].introScreen;

  // Lấy dữ liệu i18n mới thêm (Kèm fallback an toàn để web không bao giờ lỗi)
  const authExtra = translations[locale].authExtra || {
    ticker: locale === 'vi' ? '✨ Hơn 50,000+ cặp đôi đã tìm thấy không gian hạnh phúc riêng...' : '✨ Over 50,000+ couples connected globally...',
    feature1: locale === 'vi' ? '🔒 Mã hóa đầu cuối' : '🔒 End-to-End Encrypted',
    feature1Desc: locale === 'vi' ? 'Nhật ký và ảnh của hai bạn được bảo mật tuyệt đối.' : 'Your memories and letters are fully secured.',
    feature2: locale === 'vi' ? '⚡ Đồng bộ Realtime' : '⚡ Realtime Sync',
    feature2Desc: locale === 'vi' ? 'Nhận lời mời và cảm xúc của người ấy ngay lập tức.' : 'See updates and mood shifts instantly.',
    feature3: locale === 'vi' ? '🤖 Gợi ý câu hỏi AI' : '🤖 AI Daily Prompts',
    feature3Desc: locale === 'vi' ? 'Mỗi ngày một câu hỏi hâm nóng tình cảm tự động.' : 'Fresh interactive questions generated every day.',
    quote: locale === 'vi' ? '“Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.”' : '“Love does not consist in gazing at each other, but in looking outward together in the same direction.”'
  };

  // =========================================================================
  // LOGIC VÒNG LẶP VÔ TẬN (INFINITE VERTICAL SLIDER)
  // =========================================================================
  const [step, setStep] = useState(showAuth ? 1 : 0);
  const [animate, setAnimate] = useState(false);

  // Kích hoạt animation sau khi render lần đầu
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Lắng nghe lệnh từ page.tsx để nhảy tầng
  useEffect(() => {
    if (showAuth && step === 0) {
      setAnimate(true);
      setStep(1); // Trượt lên tầng 2 (Auth)
    } else if (!showAuth && step === 1) {
      setAnimate(true);
      setStep(2); // Trượt tiếp lên tầng 3 (Intro Bản sao)
    } else if (showAuth && step === 2) {
      setStep(1); // Đề phòng bấm liên tục
    }
  }, [showAuth, step]);

  // Khi trượt đến tầng 3 xong, âm thầm giật về tầng 1
  const handleTransitionEnd = () => {
    if (step === 2) {
      setAnimate(false); // Tắt hiệu ứng trượt
      setStep(0);        // Giật tức thời về tầng 1
      setTimeout(() => setAnimate(true), 50); // Bật lại hiệu ứng
    }
  };

  // =========================================================================
  // RENDER TẦNG 1 & 3: MÀN HÌNH INTRO (Tái sử dụng)
  // =========================================================================
  const renderIntroPanel = (key: string) => (
    <div key={key} className="h-1/3 w-full flex flex-col lg:flex-row relative flex-shrink-0">

      {/* CỘT VĂN BẢN (TRÁI) */}
      {/* ĐÃ FIX: Thêm h-full để đẩy Text ra chính giữa màn hình Mobile */}
      {/* SỬA UI: Tăng padding ngang trên cả điện thoại (px-10) và laptop/pc (lg:px-16) để hiển thị đẹp hơn */}
      <div className={`h-full flex-1 flex flex-col items-center lg:items-start justify-center py-6 px-10 lg:px-40 z-10 transition-all duration-700 ${showAuth ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* <div className={`inline-block px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md ${isDarkMode ? 'bg-pink-900/30 border-pink-800 text-pink-400' : 'bg-theme-100/50 border-theme-200 text-theme-600'}`}>
          {t.versionTag}
        </div> */}

        <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] mb-6 text-center lg:text-left ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {t.titleLine1} <br />
          <span className="text-theme-500">{t.titleLine2}</span>
        </h1>

        <p className={`text-sm sm:text-base lg:text-lg mb-10 max-w-lg font-medium leading-relaxed text-center lg:text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
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
            onClick={() => window.open('https://github.com/VyBaee/love-tracker', '_blank')}
            className={`px-8 py-4 rounded-full font-bold text-sm shadow-sm border transition-all active:scale-95 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-theme-600 border-theme-100 hover:bg-theme-50'}`}
          >
            <svg className="w-5 h-5 text-theme-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
            {t.githubBtn}
          </button>
        </div>
      </div>

      {/* CỘT MOCKUP UI */}
      <div className="hidden lg:flex w-full lg:w-1/2 flex-col items-center justify-center p-6 lg:px-12 relative z-10">
        <div className={`relative w-full max-w-md backdrop-blur-2xl border p-6 rounded-[2.5rem] shadow-2xl z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 ${isDarkMode ? 'bg-slate-900/40 border-slate-700/50 shadow-pink-900/10' : 'bg-white/60 border-white shadow-theme-900/10'}`}>
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

          {/* ĐÃ FIX: Thẻ Kỷ Niệm đặt absolute BÊN TRONG thẻ mẹ relative để không bị rớt */}
          <div className={`absolute bottom-[-10%] left-[-10%] backdrop-blur-xl p-5 rounded-3xl shadow-xl border z-20 animate-bounce ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white/90 border-white/50'}`} style={{ animationDuration: '3s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-theme-100 text-theme-500 rounded-full flex items-center justify-center text-lg">📸</div>
              <div>
                <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t.newMemory}</div>
                <div className="text-[10px] text-slate-500">Vừa tải lên</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // RENDER TẦNG 2: MÀN HÌNH ĐĂNG NHẬP LUXURY (Lấp đầy khoảng trống)
  // =========================================================================
  const renderAuthPanel = () => (
    <div key="panel-auth" className="h-1/3 w-full flex flex-col lg:flex-row relative flex-shrink-0 overflow-hidden">

      {/* NỬA TRÁI: Tính năng nổi bật (Chỉ hiện trên PC) */}
      <div className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center p-6 lg:px-12 pr-12 z-10 max-w-2xl mx-auto">
        <p className="text-xs font-black text-theme-500 uppercase tracking-widest mb-2">Premium Security & Experience</p>
        <h2 className={`text-3xl font-black mb-8 leading-snug ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          Không gian số lưu trữ <br />trọn vẹn hồi ức của hai người.
        </h2>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl flex-shrink-0 text-xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-theme-100'}`}>🔒</div>
            <div>
              <h4 className={`text-sm font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{authExtra.feature1}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{authExtra.feature1Desc}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl flex-shrink-0 text-xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-theme-100'}`}>⚡</div>
            <div>
              <h4 className={`text-sm font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{authExtra.feature2}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{authExtra.feature2Desc}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl flex-shrink-0 text-xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-theme-100'}`}>🤖</div>
            <div>
              <h4 className={`text-sm font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{authExtra.feature3}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{authExtra.feature3Desc}</p>
            </div>
          </div>
        </div>

        <p className="text-xs font-medium italic text-slate-400 mt-12 border-l-2 border-theme-300 pl-4 py-1 max-w-sm">
          {authExtra.quote}
        </p>
      </div>

      {/* NỬA PHẢI: Khung Auth + Polaroids bay nhảy */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative p-6 h-full">

        {/* Polaroids Bay Lơ lửng (Chỉ hiện PC) */}
        <div className={`absolute top-[10%] left-[10%] w-24 p-2 rounded-xl border shadow-lg rotate-[-12deg] pointer-events-none hidden xl:block transition-all duration-700 animate-bounce ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`} style={{ animationDuration: '6s' }}>
          <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden mb-2">
            <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=150" className="w-full h-full object-cover opacity-80" alt="polaroid" />
          </div>
          <div className="h-1 w-10 bg-theme-300 rounded-full mx-auto"></div>
        </div>

        <div className={`absolute bottom-[15%] right-[10%] w-28 p-2 rounded-xl border shadow-lg rotate-[8deg] pointer-events-none hidden xl:block transition-all duration-700 animate-bounce ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`} style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden mb-2">
            <img src="https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=150" className="w-full h-full object-cover opacity-80" alt="polaroid" />
          </div>
          <div className="h-1 w-14 bg-purple-300 rounded-full mx-auto"></div>
        </div>

        {/* Khung Form Chính: Đã giới hạn max-width để không bị dẹp */}
        <div className="w-full max-w-sm lg:max-w-[400px] z-10">
          <Auth onBack={onBack} locale={locale} />
        </div>
      </div>

      {/* Dòng Ticker chạy ngang đáy màn hình */}
      {/* <div className={`absolute bottom-0 left-0 w-full py-3 border-t overflow-hidden whitespace-nowrap hidden lg:block ${isDarkMode ? 'bg-slate-950/80 border-slate-900' : 'bg-white/40 border-theme-50'}`}>
        <div className="inline-block animate-pulse text-[11px] font-bold tracking-wider text-slate-400/80 px-12">
          {authExtra.ticker} &nbsp;&nbsp;&nbsp;&nbsp; {authExtra.ticker} &nbsp;&nbsp;&nbsp;&nbsp; {authExtra.ticker}
        </div>
      </div> */}
    </div>
  );

  return (
    <div className={`h-screen min-h-screen w-full flex flex-col transition-colors duration-500 relative overflow-hidden font-sans ${isDarkMode ? 'bg-slate-950' : 'bg-theme-50'}`}>
      <FloatingHearts />

      {/* Nền trang trí chung */}
      {/* Thêm pointer-events-none vào 2 thẻ này */}
      <div className={`pointer-events-none absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] animate-blob ${isDarkMode ? 'bg-pink-900/20' : 'bg-theme-400/20'}`}></div>
      <div className={`pointer-events-none absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-400/20'}`}></div>

      {/* NAVBAR */}
      <nav className="w-full flex items-center justify-between p-6 lg:px-12 relative z-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-base sm:text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>LoveTracker</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center backdrop-blur-md p-1 rounded-full border shadow-sm ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-theme-100'}`}>
            <button onClick={() => setLocale('vi')} className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all ${locale === 'vi' ? (isDarkMode ? 'bg-pink-900/50 scale-105 shadow-sm' : 'bg-theme-100 scale-105 shadow-sm') : (isDarkMode ? 'hover:bg-slate-700 opacity-60 grayscale' : 'hover:bg-theme-50 opacity-60 grayscale')}`}>
              <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="w-4 h-auto rounded-[2px]" />
            </button>
            <button onClick={() => setLocale('en')} className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all ${locale === 'en' ? (isDarkMode ? 'bg-pink-900/50 scale-105 shadow-sm' : 'bg-theme-100 scale-105 shadow-sm') : (isDarkMode ? 'hover:bg-slate-700 opacity-60 grayscale' : 'hover:bg-theme-50 opacity-60 grayscale')}`}>
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
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md border shadow-sm flex items-center justify-center hover:scale-105 transition-all ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white/80 border-theme-100 text-theme-600'}`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* BĂNG CHUYỀN TRƯỢT (SLIDER CONTAINER) */}
      <div className="flex-1 w-full relative overflow-hidden z-10">
        <div
          className={`w-full flex flex-col ${animate ? 'transition-transform duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1)' : ''}`}
          style={{ height: '300%', transform: `translateY(-${(step * 100) / 3}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {/* Tầng 1: Intro */}
          {renderIntroPanel('panel-1')}

          {/* Tầng 2: Auth */}
          {renderAuthPanel()}

          {/* Tầng 3: Intro (Bản sao để cuộn vô tận) */}
          {renderIntroPanel('panel-3')}
        </div>
      </div>

    </div>
  );
}