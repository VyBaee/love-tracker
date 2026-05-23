'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';

interface AuthProps {
  onBack: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export default function Auth({ onBack, locale, setLocale, isDarkMode, setIsDarkMode }: AuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const t = translations[locale].auth;

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthColors = ['bg-slate-200', 'bg-red-400', 'bg-orange-400', 'bg-theme-400', 'bg-green-500'];

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg(''); setSuccessMsg('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setErrorMsg(t.msgUnverified); setIsVerifying(true);
        } else {
          setErrorMsg(t.msgWrongCreds);
        }
      }
    } else {
      if (password !== confirmPassword) {
        setErrorMsg(t.msgPassMismatch); setIsLoading(false); return;
      }
      if (strength < 2) {
        setErrorMsg(t.msgWeakPass); setIsLoading(false); return;
      }

      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { username: username } }
      });

      if (error) {
        setErrorMsg(error.message.includes('already registered') ? t.msgEmailInUse : t.msgError);
      } else {
        setSuccessMsg(t.msgOtpSent); setIsVerifying(true);
      }
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');

    const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
    if (error) {
      setErrorMsg(t.msgOtpInvalid);
    } else {
      setSuccessMsg(t.msgOtpSuccess);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg(''); setSuccessMsg('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setErrorMsg(t.msgError);
    } else {
      setSuccessMsg(t.msgResetSent);
      setIsForgotPassword(false);
      setIsResetting(true);
    }
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg(''); setSuccessMsg('');

    if (strength < 2) {
      setErrorMsg(t.msgWeakPass); setIsLoading(false); return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'recovery' });
    if (verifyError) {
      setErrorMsg(t.msgRecoveryInvalid); setIsLoading(false); return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: password });
    if (updateError) setErrorMsg(t.msgError);
    else setSuccessMsg(t.msgPassUpdated);

    setIsLoading(false);
  };

  return (
    <div className={`flex min-h-screen items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-theme-50'}`}>
      
      {/* Cụm Ngôn Ngữ & Dark Mode (Góc Phải) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-3">
        <div className={`flex items-center backdrop-blur-md p-1 rounded-full border shadow-sm ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-theme-100'}`}>
          <button onClick={() => setLocale('vi')} className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all ${locale === 'vi' ? (isDarkMode ? 'bg-pink-900/50 scale-105 shadow-sm' : 'bg-theme-100 scale-105 shadow-sm') : (isDarkMode ? 'hover:bg-slate-700 opacity-60 grayscale' : 'hover:bg-theme-50 opacity-60 grayscale')}`}>
            <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="w-4 sm:w-5 h-auto rounded-[2px]" />
          </button>
          <button onClick={() => setLocale('en')} className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all ${locale === 'en' ? (isDarkMode ? 'bg-pink-900/50 scale-105 shadow-sm' : 'bg-theme-100 scale-105 shadow-sm') : (isDarkMode ? 'hover:bg-slate-700 opacity-60 grayscale' : 'hover:bg-theme-50 opacity-60 grayscale')}`}>
            <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-4 sm:w-5 h-auto rounded-[2px]" />
          </button>
        </div>

        <button 
          onClick={toggleTheme}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-md border shadow-sm flex items-center justify-center hover:scale-105 transition-all ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white/80 border-theme-100 text-theme-600'}`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Trang Trí Nền */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob ${isDarkMode ? 'bg-pink-900/20' : 'bg-theme-100 opacity-70'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 ${isDarkMode ? 'bg-purple-900/20' : 'bg-theme-200 opacity-70'}`}></div>

      {/* Khung Auth Chính */}
      <div className={`w-full max-w-sm backdrop-blur-xl p-8 rounded-[2.5rem] shadow-cute relative z-10 border animate-fade-in ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white'}`}>
        
        {/* Nút Quay Lại Nằm BÊN TRONG Khung Auth (Góc trên trái) */}
        <button 
          onClick={onBack} 
          className={`absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-theme-500'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        <div className="text-center mb-6">
          <div className={`inline-block p-4 rounded-full mb-3 shadow-inner ${isDarkMode ? 'bg-pink-900/50' : 'bg-theme-100'}`}>
            <span className="text-4xl animate-pulse inline-block">💖</span>
          </div>
          <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-theme-400' : 'text-theme-600'}`}>Love Tracker</h2>
          <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
            {isVerifying ? t.verifyEmail : isForgotPassword || isResetting ? t.resetPassTitle : (isLogin ? t.login : t.register)}
          </p>
        </div>

        {/* --- CÁC FORM TÙY TRẠNG THÁI --- */}

        {/* 1. XÁC THỰC OTP ĐĂNG KÝ */}
        {isVerifying ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
            <p className={`text-sm text-center font-medium mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t.otpSentTo} <br/><span className="font-bold text-theme-500">{email}</span></p>
            <div>
              <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} className={`w-full border rounded-2xl p-4 text-center text-2xl font-bold tracking-[1em] outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 transition-all shadow-inner ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder={t.placeholderOTP} required />
            </div>
            {errorMsg && <p className={`text-xs font-bold text-center p-2 rounded-xl ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'}`}>{errorMsg}</p>}
            {successMsg && <p className={`text-xs font-bold text-center p-2 rounded-xl ${isDarkMode ? 'bg-theme-900/30 text-theme-400' : 'bg-theme-50 text-theme-600'}`}>{successMsg}</p>}
            <button type="submit" disabled={isLoading} className="w-full btn-cute py-4 text-lg mt-2 disabled:opacity-50">{isLoading ? t.btnVerifying : t.btnConfirmOTP}</button>
            <button type="button" onClick={() => setIsVerifying(false)} className={`w-full text-xs font-bold mt-2 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-theme-400' : 'text-slate-400 hover:text-theme-500'}`}>{t.btnBack}</button>
          </form>
        ) 
        
        /* 2. QUÊN MẬT KHẨU */
        : isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
            <p className={`text-sm text-center font-medium mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t.enterEmailToReset}</p>
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wider px-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.labelEmail}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full border rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder={t.placeholderEmail} required />
            </div>
            {errorMsg && <p className={`text-xs font-bold text-center p-2 rounded-xl ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'}`}>{errorMsg}</p>}
            {successMsg && <p className={`text-xs font-bold text-center p-2 rounded-xl ${isDarkMode ? 'bg-theme-900/30 text-theme-400' : 'bg-theme-50 text-theme-600'}`}>{successMsg}</p>}
            <button type="submit" disabled={isLoading} className="w-full btn-cute py-4 text-sm mt-4 disabled:opacity-50">{isLoading ? t.btnProcessing : t.btnSendReset}</button>
            <button type="button" onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }} className={`w-full text-[11px] font-bold mt-4 uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-500 hover:text-theme-400' : 'text-slate-500 hover:text-theme-500'}`}>{t.btnBack}</button>
          </form>
        ) 
        
        /* 3. ĐẶT LẠI MẬT KHẨU MỚI */
        : isResetting ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4 animate-fade-in">
            <p className={`text-sm text-center font-medium mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t.otpSentTo} <br/><span className="font-bold text-theme-500">{email}</span></p>
            <div>
              <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} className={`w-full border rounded-2xl p-4 text-center text-2xl font-bold tracking-[1em] outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 transition-all shadow-inner ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder={t.placeholderOTP} required />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wider px-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.labelNewPass}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full border rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder={t.placeholderPass} required />
              {password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className={`flex gap-1 h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    {[1, 2, 3, 4].map((level) => (<div key={level} className={`h-full flex-1 transition-all duration-300 ${strength >= level ? strengthColors[strength] : 'bg-transparent'}`}></div>))}
                  </div>
                  <p className={`text-[10px] font-bold mt-1 text-right ${strength < 2 ? 'text-red-400' : 'text-green-500'}`}>{t.strengthLabels[strength]}</p>
                </div>
              )}
            </div>
            {errorMsg && <p className={`text-xs font-bold text-center p-2 rounded-xl ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'}`}>{errorMsg}</p>}
            {successMsg && <p className={`text-xs font-bold text-center p-2 rounded-xl ${isDarkMode ? 'bg-theme-900/30 text-theme-400' : 'bg-theme-50 text-theme-600'}`}>{successMsg}</p>}
            <button type="submit" disabled={isLoading} className="w-full btn-cute py-4 text-sm mt-4 disabled:opacity-50">{isLoading ? t.btnProcessing : t.btnUpdatePass}</button>
            <button type="button" onClick={() => { setIsResetting(false); setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }} className={`w-full text-xs font-bold mt-2 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-theme-400' : 'text-slate-400 hover:text-theme-500'}`}>{t.btnBack}</button>
          </form>
        ) 
        
        /* 4. ĐĂNG NHẬP / ĐĂNG KÝ MẶC ĐỊNH */
        : (
          <form onSubmit={handleAuth} className="space-y-3 animate-fade-in">
            {!isLogin && (
              <div>
                <label className={`block text-xs font-bold mb-1 uppercase tracking-wider px-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.labelName}</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={`w-full border rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder={t.placeholderName} required={!isLogin} />
              </div>
            )}
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wider px-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.labelEmail}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full border rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder={t.placeholderEmail} required />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wider px-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.labelPass}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full border rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder={t.placeholderPass} required />
              
              {/* Nút Quên mật khẩu */}
              {isLogin && (
                <div className="text-right px-1 mt-1">
                  <button type="button" onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); setOtpCode(''); }} className={`text-[11px] font-bold transition-colors ${isDarkMode ? 'text-theme-400 hover:text-theme-300' : 'text-theme-500 hover:text-theme-600'}`}>
                    {t.forgotPassword}
                  </button>
                </div>
              )}

              {/* Sức mạnh mật khẩu */}
              {!isLogin && password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className={`flex gap-1 h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    {[1, 2, 3, 4].map((level) => (<div key={level} className={`h-full flex-1 transition-all duration-300 ${strength >= level ? strengthColors[strength] : 'bg-transparent'}`}></div>))}
                  </div>
                  <p className={`text-[10px] font-bold mt-1 text-right ${strength < 2 ? 'text-red-400' : 'text-green-500'}`}>
                    {t.strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>
            {!isLogin && (
              <div>
                <label className={`block text-xs font-bold mb-1 uppercase tracking-wider px-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.labelConfirmPass}</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full border rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder={t.placeholderPass} required={!isLogin} />
              </div>
            )}
            
            {errorMsg && <p className={`text-xs font-bold text-center p-2 rounded-xl ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500'}`}>{errorMsg}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full btn-cute py-4 text-sm mt-4 disabled:opacity-50">
              {isLoading ? t.btnProcessing : (isLogin ? t.btnLogin : t.btnRegister)}
            </button>
          </form>
        )}

        {/* Nút lật form đăng nhập/đăng ký */}
        {!isVerifying && !isForgotPassword && !isResetting && (
          <div className="mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setPassword(''); setConfirmPassword(''); }} className={`text-[11px] font-bold transition-colors uppercase tracking-widest ${isDarkMode ? 'text-slate-400 hover:text-theme-400' : 'text-slate-500 hover:text-theme-500'}`}>
              {isLogin ? t.switchRegister : t.switchLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}