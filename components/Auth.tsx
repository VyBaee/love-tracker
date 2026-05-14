'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // Các trạng thái màn hình con
  const [isVerifying, setIsVerifying] = useState(false); // Đang nhập OTP đăng ký
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Đang yêu cầu quên pass
  const [isResetting, setIsResetting] = useState(false); // Đang nhập OTP + Pass mới

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [locale, setLocale] = useState<Locale>('vi');
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

  // 1. Luồng Đăng nhập / Đăng ký
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

  // 2. Luồng xác nhận OTP khi Đăng ký
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

  // 3. Luồng Quên mật khẩu (Gửi email)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg(''); setSuccessMsg('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setErrorMsg(t.msgError);
    } else {
      setSuccessMsg(t.msgResetSent);
      setIsForgotPassword(false);
      setIsResetting(true); // Chuyển sang màn hình nhập mã và đổi pass
    }
    setIsLoading(false);
  };

  // 4. Luồng Cập nhật Mật khẩu Mới (Nhập mã + đổi pass)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg(''); setSuccessMsg('');

    if (strength < 2) {
      setErrorMsg(t.msgWeakPass); setIsLoading(false); return;
    }

    // Bước 4.1: Xác thực mã OTP dạng Khôi phục
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'recovery'
    });

    if (verifyError) {
      setErrorMsg(t.msgRecoveryInvalid);
      setIsLoading(false);
      return;
    }

    // Bước 4.2: Cập nhật pass mới
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setErrorMsg(t.msgError);
    } else {
      setSuccessMsg(t.msgPassUpdated);
      // Supabase tự động log in người dùng khi update thành công, page.tsx sẽ tự nhảy vào App!
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-theme-50 relative overflow-hidden font-sans">
      
      {/* Bộ chọn ngôn ngữ */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <button onClick={() => setLocale('vi')} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${locale === 'vi' ? 'bg-theme-100 scale-105 shadow-inner' : 'hover:bg-slate-50 opacity-60 grayscale'}`}>
          <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="w-4 h-auto rounded-[2px] shadow-sm" />
        </button>
        <button onClick={() => setLocale('en')} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${locale === 'en' ? 'bg-theme-100 scale-105 shadow-inner' : 'hover:bg-slate-50 opacity-60 grayscale'}`}>
          <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-4 h-auto rounded-[2px] shadow-sm" />
        </button>
      </div>

      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-theme-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-theme-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-cute relative z-10 border border-white animate-fade-in">
        
        <div className="text-center mb-6">
          <div className="inline-block bg-theme-100 p-4 rounded-full mb-3 shadow-inner">
            <span className="text-4xl animate-pulse inline-block">💖</span>
          </div>
          <h2 className="text-2xl font-bold text-theme-600 mb-1">Love Tracker</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            {isVerifying ? t.verifyEmail : isForgotPassword || isResetting ? t.resetPassTitle : (isLogin ? t.login : t.register)}
          </p>
        </div>

        {/* CÁC GIAO DIỆN HIỂN THỊ DỰA TRÊN TRẠNG THÁI */}

        {/* A. ĐANG ĐĂNG KÝ: NHẬP OTP */}
        {isVerifying ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
            <p className="text-sm text-center font-medium text-slate-600 mb-4">{t.otpSentTo} <br/><span className="font-bold text-theme-500">{email}</span></p>
            <div>
              <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center text-2xl font-bold tracking-[1em] outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 transition-all shadow-inner" placeholder={t.placeholderOTP} required />
            </div>
            {errorMsg && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-xl">{errorMsg}</p>}
            {successMsg && <p className="text-theme-600 text-xs font-bold text-center bg-theme-50 p-2 rounded-xl">{successMsg}</p>}
            <button type="submit" disabled={isLoading} className="w-full btn-cute py-4 text-lg mt-2 disabled:opacity-50">{isLoading ? t.btnVerifying : t.btnConfirmOTP}</button>
            <button type="button" onClick={() => setIsVerifying(false)} className="w-full text-xs font-bold text-slate-400 hover:text-theme-500 mt-2">{t.btnBack}</button>
          </form>
        ) 
        
        /* B. ĐANG QUÊN PASS: NHẬP EMAIL */
        : isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
            <p className="text-sm text-center font-medium text-slate-600 mb-4">{t.enterEmailToReset}</p>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider px-1">{t.labelEmail}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all" placeholder={t.placeholderEmail} required />
            </div>
            {errorMsg && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-xl">{errorMsg}</p>}
            {successMsg && <p className="text-theme-600 text-xs font-bold text-center bg-theme-50 p-2 rounded-xl">{successMsg}</p>}
            <button type="submit" disabled={isLoading} className="w-full btn-cute py-4 text-sm mt-4 disabled:opacity-50">{isLoading ? t.btnProcessing : t.btnSendReset}</button>
            <button type="button" onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }} className="w-full text-[11px] font-bold text-slate-500 hover:text-theme-500 mt-4 uppercase tracking-widest">{t.btnBack}</button>
          </form>
        ) 
        
        /* C. ĐANG ĐỔI PASS MỚI: NHẬP OTP + PASS */
        : isResetting ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4 animate-fade-in">
            <p className="text-sm text-center font-medium text-slate-600 mb-4">{t.otpSentTo} <br/><span className="font-bold text-theme-500">{email}</span></p>
            <div>
              <input type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center text-2xl font-bold tracking-[1em] outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 transition-all shadow-inner" placeholder={t.placeholderOTP} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider px-1">{t.labelNewPass}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all" placeholder={t.placeholderPass} required />
              {password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map((level) => (<div key={level} className={`h-full flex-1 transition-all duration-300 ${strength >= level ? strengthColors[strength] : 'bg-transparent'}`}></div>))}
                  </div>
                  <p className={`text-[10px] font-bold mt-1 text-right ${strength < 2 ? 'text-red-400' : 'text-green-500'}`}>{t.strengthLabels[strength]}</p>
                </div>
              )}
            </div>
            {errorMsg && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-xl">{errorMsg}</p>}
            {successMsg && <p className="text-theme-600 text-xs font-bold text-center bg-theme-50 p-2 rounded-xl">{successMsg}</p>}
            <button type="submit" disabled={isLoading} className="w-full btn-cute py-4 text-sm mt-4 disabled:opacity-50">{isLoading ? t.btnProcessing : t.btnUpdatePass}</button>
            <button type="button" onClick={() => { setIsResetting(false); setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }} className="w-full text-xs font-bold text-slate-400 hover:text-theme-500 mt-2">{t.btnBack}</button>
          </form>
        ) 
        
        /* D. FORM GỐC: ĐĂNG NHẬP HOẶC ĐĂNG KÝ */
        : (
          <form onSubmit={handleAuth} className="space-y-3 animate-fade-in">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider px-1">{t.labelName}</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all" placeholder={t.placeholderName} required={!isLogin} />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider px-1">{t.labelEmail}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all" placeholder={t.placeholderEmail} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider px-1">{t.labelPass}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all" placeholder={t.placeholderPass} required />
              
              {/* Nút Quên mật khẩu (Chỉ hiện lúc Đăng nhập) */}
              {isLogin && (
                <div className="text-right px-1 mt-1">
                  <button type="button" onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); setOtpCode(''); }} className="text-[11px] font-bold text-theme-500 hover:text-theme-600 transition-colors">
                    {t.forgotPassword}
                  </button>
                </div>
              )}

              {/* Thanh sức mạnh pass (Chỉ hiện lúc đăng ký) */}
              {!isLogin && password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
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
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider px-1">{t.labelConfirmPass}</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:border-theme-400 transition-all" placeholder={t.placeholderPass} required={!isLogin} />
              </div>
            )}
            {errorMsg && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-xl">{errorMsg}</p>}
            <button type="submit" disabled={isLoading} className="w-full btn-cute py-4 text-sm mt-4 disabled:opacity-50">
              {isLoading ? t.btnProcessing : (isLogin ? t.btnLogin : t.btnRegister)}
            </button>
          </form>
        )}

        {/* Nút lật form đăng nhập/đăng ký (Chỉ hiện ở màn hình gốc) */}
        {!isVerifying && !isForgotPassword && !isResetting && (
          <div className="mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setPassword(''); setConfirmPassword(''); }} className="text-[11px] font-bold text-slate-500 hover:text-theme-500 transition-colors uppercase tracking-widest">
              {isLogin ? t.switchRegister : t.switchLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}