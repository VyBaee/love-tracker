'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';
import ProfileModal from './ProfileModal';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function SingleDashboard({ session, myProfile, onPaired, onProfileUpdated }: any) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const [inviteUid, setInviteUid] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  const [locale, setLocale] = useState<Locale>('vi');
  const t = translations[locale].singleDashboard;

  const displayName = myProfile?.display_name || session.user.user_metadata?.username || 'Người dùng';

  const slides = [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=cover',
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=cover',
    'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=600&auto=format&fit=cover'
  ];

  useEffect(() => {
    fetchInvites();
    const channel = supabase.channel('public:pairing_invites')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pairing_invites', filter: `receiver_email=eq.${session.user.email}` }, () => {
        fetchInvites();
      }).subscribe();

    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(slideInterval);
    };
  }, []);

  // KHU VỰC CẬP NHẬT TUTORIAL HƯỚNG DẪN DÀNH CHO DESKTOP VÀ MOBILE
  useEffect(() => {
    if (!session?.user?.id || !myProfile) return;

    const singleTutorialKey = `love_tracker_single_tutorial_${session.user.id}`;
    const hasSeenTutorial = myProfile?.has_seen_single_tutorial;

    if (!hasSeenTutorial) {
      const isDesktop = window.innerWidth >= 1024;
      
      const commonStep1 = {
        popover: {
          title: '<div class="vi-title">Xin chào</div><div class="en-title">Hello!</div>',
          description: '<div class="vi-desc">Hướng dẫn nhanh cách rước "nửa kia" về nhà chung nhé!</div><div class="en-desc">Let\'s learn how to invite your partner here!</div>',
          align: 'center'
        }
      };

      const commonStep2 = {
        element: '#pair-section', popover: {
          title: '<div class="vi-title">Ghép Đôi</div><div class="en-title">Pair Up</div>',
          description: '<div class="vi-desc">Nhập UID của người ấy vào đây để gửi lời mời.</div><div class="en-desc">Enter their UID here to send an invite.</div>',
          side: isDesktop ? "right" : "bottom", align: 'center'
        }
      };

      const desktopNotificationStep = {
        element: '#notification-desktop-section', popover: {
          title: '<div class="vi-title">Thông báo</div><div class="en-title">Notifications</div>',
          description: '<div class="vi-desc">Bạn sẽ nhận được yêu cầu ghép đôi trực tiếp ở cột này.</div><div class="en-desc">Your pairing invites will appear in this column.</div>',
          side: "left", align: 'center'
        }
      };

      const mobileNotificationStep = {
        element: '#notification-btn', popover: {
          title: '<div class="vi-title">Thông báo</div><div class="en-title">Notifications</div>',
          description: '<div class="vi-desc">Lời mời ghép đôi sẽ nằm ở đây. Nhớ kiểm tra nha!</div><div class="en-desc">Check your pairing invites here!</div>',
          side: "bottom", align: 'center'
        }
      };

      const avatarStep = {
        element: '#edit-profile-btn', popover: {
          title: '<div class="vi-title">Profile</div><div class="en-title">Profile</div>',
          description: '<div class="vi-desc">Đổi Avatar và tên để người ấy dễ nhận ra nhé.</div><div class="en-desc">Change your avatar so they can recognize you.</div>',
          side: "bottom", align: 'center'
        }
      };

      const langStep = {
        element: '#lang-btn', popover: {
          title: '<div class="vi-title">Ngôn Ngữ</div><div class="en-title">Language</div>',
          description: '<div class="vi-desc">Đây là khu vực thay đổi ngôn ngữ.</div><div class="en-desc">This is where you can change the language.</div>',
          side: "bottom", align: 'center'
        }
      };

      const steps = isDesktop 
        ? [commonStep1, commonStep2, desktopNotificationStep, avatarStep, langStep]
        : [commonStep1, commonStep2, avatarStep, mobileNotificationStep, langStep];

      const driverObj = driver({
        showProgress: true,
        animate: true,
        popoverClass: 'no-arrow',
        nextBtnText: 'Tiếp ➔<br><span class="en-btn">Next</span>',
        prevBtnText: '⬅ Lùi<br><span class="en-btn">Back</span>',
        doneBtnText: 'Bắt đầu!<br><span class="en-btn">Let\'s go!</span>',
        steps: steps,
        onDestroyStarted: async () => {
          localStorage.setItem(singleTutorialKey, 'true');
          await supabase.from('profiles').update({ has_seen_single_tutorial: true }).eq('id', session.user.id);
          if (onProfileUpdated) onProfileUpdated();
          driverObj.destroy();
        }
      });
      setTimeout(() => { driverObj.drive(); }, 800);
    }
  }, [session?.user?.id, myProfile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    }
  }, []);

  const fetchInvites = async () => {
    const { data } = await supabase.from('pairing_invites').select('*, sender:profiles!sender_id(display_name, avatar_url, zodiac)').eq('receiver_email', session.user.email).eq('status', 'pending');
    if (data) setInvites(data);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUid = inviteUid.trim();

    if (targetUid === myProfile?.uid) {
      showToast(t.toastSelf || 'Bạn không thể ghép đôi với chính mình!');
      return;
    }

    const { data: targetUser, error: findError } = await supabase
      .from('profiles')
      .select('email, id')
      .eq('uid', targetUid)
      .maybeSingle();

    if (findError || !targetUser) {
      showToast(locale === 'vi' ? 'Không tìm thấy người dùng với ID này!' : 'User ID not found!');
      return;
    }

    const { error } = await supabase.from('pairing_invites').insert([{
      sender_id: session.user.id,
      receiver_email: targetUser.email,
      message: inviteMessage.trim()
    }]);

    if (!error) {
      showToast(t.toastSuccess || 'Gửi lời mời thành công!');
      setInviteUid('');
      setInviteMessage('');
    } else {
      showToast(t.toastError || 'Lỗi gửi lời mời!');
    }
  };

  const handleAccept = async (inviteId: string, senderId: string) => {
    const { error } = await supabase.from('couples').insert([{ user1_id: senderId, user2_id: session.user.id, start_date: new Date().toISOString().split('T')[0] }]);
    if (!error) {
      await supabase.from('pairing_invites').update({ status: 'accepted' }).eq('id', inviteId);
      onPaired();
    }
  };

  const handleReject = async (inviteId: string) => {
    await supabase.from('pairing_invites').update({ status: 'rejected' }).eq('id', inviteId);
    fetchInvites();
    setShowNotifModal(false);
  };

  const firstInvite = invites.length > 0 ? invites[0] : null;

  return (
    <>
      {toastMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white border-2 border-theme-200 text-theme-600 px-6 py-3 rounded-2xl shadow-cute-lg z-[100] animate-bounce text-sm font-bold w-max max-w-[90%] text-center">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAV */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-3">

        <div id="lang-btn" className="flex items-center bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-theme-100 shadow-sm">
          <button onClick={() => setLocale('vi')} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${locale === 'vi' ? 'bg-theme-100 scale-105 shadow-sm' : 'hover:bg-theme-50 opacity-60 grayscale'}`}>
            <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="w-5 h-auto rounded-[2px]" />
          </button>
          <button onClick={() => setLocale('en')} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${locale === 'en' ? 'bg-theme-100 scale-105 shadow-sm' : 'hover:bg-theme-50 opacity-60 grayscale'}`}>
            <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-5 h-auto rounded-[2px]" />
          </button>
        </div>

        <button id="notification-btn" onClick={() => setShowNotifModal(true)} className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-theme-100 shadow-cute flex items-center justify-center text-theme-400 hover:text-theme-500 hover:scale-105 transition-all relative lg:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          {invites.length > 0 && <span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
        </button>

        <div className="relative">
          <button id="edit-profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-12 h-12 rounded-full bg-theme-50 border border-theme-100 shadow-cute overflow-hidden flex items-center justify-center hover:scale-105 transition-transform">
            {myProfile?.avatar_url ? <img src={myProfile.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : displayName.charAt(0)}
          </button>
          {showProfileMenu && (
            <div className="absolute top-14 right-0 w-52 bg-white border border-theme-50 rounded-2xl shadow-cute-lg py-2 animate-fade-in origin-top-right z-50">
              <div className="px-4 py-3 border-b border-theme-50 mb-1">
                <p className="text-sm font-bold text-slate-700 truncate">{displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[11px] text-slate-400 truncate">ID: {myProfile?.uid || '------'}</p>
                  {myProfile?.uid && (
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(myProfile.uid); showToast(locale === 'vi' ? 'Đã copy ID! ' : 'Copied ID! '); }} className="text-slate-400 hover:text-theme-500 p-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                  )}
                </div>
              </div>

              <button onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-theme-50 transition-colors">
                {t.editProfileLabel || translations[locale].profile.edit}
              </button>

              <button onClick={() => { const newMode = !isDarkMode; setIsDarkMode(newMode); localStorage.setItem('theme', newMode ? 'dark' : 'light'); if (newMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-theme-50 transition-colors flex items-center justify-between">
                <span>{isDarkMode ? (locale === 'vi' ? 'Chế độ Sáng' : 'Light Mode') : (locale === 'vi' ? 'Chế độ Tối' : 'Dark Mode')}</span>
                <span className="text-base">{isDarkMode ? '☀️' : '🌙'}</span>
              </button>

              <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                {t.logoutLabel || translations[locale].profile.logout}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md lg:max-w-5xl bg-white/80 backdrop-blur-xl p-6 lg:p-10 rounded-[2.5rem] shadow-cute relative z-10 border border-white flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch min-h-[500px] lg:min-h-[650px] mt-16 animate-fade-in">

        <div id="pair-section" className="w-full lg:w-[45%] flex flex-col justify-center text-center lg:text-left pr-0 lg:pr-4">
          <div className="mb-6 relative inline-block mx-auto lg:mx-0">
            <div className="w-24 h-24 bg-theme-100 rounded-full flex items-center justify-center text-5xl shadow-inner animate-blob">🏠</div>
          </div>

          <h2 className="text-2xl font-black text-theme-600 mb-2">{t.welcomeTitle?.replace('{name}', displayName) || `Chào mừng, ${displayName}`}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{t.myIdLabel || 'Mã ID của bạn:'} <span className="text-theme-500 text-sm font-black select-all">{myProfile?.uid || '--------'}</span></p>

          <p className="text-sm text-slate-500 font-medium mb-8 lg:mb-6 leading-relaxed">
            {t.emptyTitle}<br />
            {t.emptyDesc}
          </p>

          <form onSubmit={handleSendInvite} className="space-y-3 w-full">
            <input
              type="text"
              value={inviteUid}
              onChange={(e) => setInviteUid(e.target.value.replace(/\D/g, ''))}
              maxLength={8}
              placeholder={t.inputPartnerIdPlaceholder || "Nhập mã số ID đối phương (8 số)..."}
              className="w-full bg-theme-50 border border-theme-100 rounded-2xl p-4 text-sm outline-none focus:border-theme-400 shadow-inner text-center font-bold text-slate-700 transition-all"
              required
            />

            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              maxLength={200}
              placeholder={t.inputMessagePlaceholder || "Nhập câu tỏ tình hoặc lời mời (không bắt buộc)..."}
              rows={2}
              className="w-full bg-theme-50 border border-theme-100 rounded-2xl p-4 text-sm outline-none focus:border-theme-400 shadow-inner text-slate-700 transition-all resize-none"
            />

            <button type="submit" className="btn-cute px-8 py-4 text-sm font-bold w-full shadow-cute-lg">
              {t.btnInvite || 'Gửi lời mời kết đôi'}
            </button>
          </form>
        </div>

        <div className="hidden lg:block w-px bg-theme-50 my-4"></div>

        <div id="notification-desktop-section" className="hidden lg:flex flex-1 w-full rounded-3xl overflow-hidden relative border border-theme-50 bg-theme-50 items-center justify-center min-h-[500px]">

          {firstInvite ? (
            <div className="absolute inset-0 bg-white p-8 flex flex-col items-center justify-center text-center z-20 animate-fade-in shadow-[0_0_50px_-15px_rgba(236,72,153,0.3)]">
              
              <h2 className="text-2xl font-black text-pink-500 mb-2 tracking-wide">
                {t.inviteModalHeader || 'Hộp thư lời mời'}
              </h2>
              <div className="w-12 h-1 bg-pink-300 rounded-full mb-8 opacity-70"></div>

              <div className="w-28 h-28 rounded-full bg-theme-50 border-[6px] border-white shadow-md overflow-hidden flex items-center justify-center font-black text-slate-600 text-5xl mb-4 relative z-10">
                {firstInvite.sender?.avatar_url ? (
                  <img src={firstInvite.sender.avatar_url} className="w-full h-full object-cover" alt="inviter avatar" />
                ) : (
                  (firstInvite.sender?.display_name || '?').charAt(0).toUpperCase()
                )}
              </div>

              <h3 className="text-xl font-black text-slate-700 mb-6 tracking-wide">
                {firstInvite.sender?.display_name || firstInvite.sender_id}
              </h3>

              <div className="bg-theme-50 border border-theme-100 rounded-[2.5rem] p-8 w-full max-w-sm shadow-inner relative mb-6 flex flex-col justify-center min-h-[140px]">
                <span className="text-5xl text-slate-300 font-serif absolute top-4 left-6 select-none pointer-events-none leading-none">“</span>
                <p className="text-sm font-bold italic text-slate-600 leading-relaxed relative z-10 px-4">
                  {firstInvite.message || (locale === 'vi' ? 'Không có lời nhắn nào được cung cấp.' : 'No message provided by the inviter.')}
                </p>
                <span className="text-5xl text-slate-300 font-serif absolute bottom-0 right-6 select-none pointer-events-none leading-none">”</span>
              </div>

              <p className="text-[10px] font-bold text-slate-400 mb-6 tracking-widest uppercase">
                {t.acceptDescription || 'Mở cánh cửa để cùng nhau xây dựng thế giới riêng nào.'}
              </p>

              <div className="flex gap-4 w-full max-w-sm px-4">
                <button 
                  onClick={() => handleReject(firstInvite.id)} 
                  className="flex-1 bg-white border border-theme-200 text-slate-500 py-4 rounded-2xl font-black text-sm hover:bg-theme-50 transition-all shadow-sm active:scale-95"
                >
                  {t.btnReject || 'Từ chối'}
                </button>
                <button 
                  onClick={() => handleAccept(firstInvite.id, firstInvite.sender_id)} 
                  className="flex-1 bg-pink-500 text-white py-4 rounded-2xl font-black text-sm shadow-[0_8px_20px_rgba(236,72,153,0.4)] hover:bg-pink-400 transition-all active:scale-95"
                >
                  {t.btnAccept || 'Đồng ý'}
                </button>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-theme-50">
              {slides.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="Romantic Slide"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === activeSlide ? 'opacity-30 scale-100' : 'opacity-0 scale-105'} transform`}
                />
              ))}
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none z-10">
                <div className="text-4xl animate-pulse mb-3">✨</div>
                <h3 className="text-base font-black text-slate-700">{t.waitingPartner || 'Đang chờ...'}</h3>
                <p className="text-xs text-slate-400 font-bold leading-relaxed mt-2">{t.waitingPartnerDesc}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL THÔNG BÁO CHO MOBILE */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] px-4 lg:hidden">
          <div className="bg-white p-6 rounded-[2rem] w-full max-w-sm shadow-2xl animate-fade-in relative flex flex-col items-center">
            <button onClick={() => setShowNotifModal(false)} className="absolute top-4 right-4 bg-theme-50 text-slate-400 w-8 h-8 rounded-full font-bold hover:bg-theme-100 transition-colors">✕</button>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400 mb-6 mt-2">
              {t.inviteModalHeader || 'Hộp thư lời mời'}
            </h2>
            
            <div className="w-full flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {invites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
                  <p className="text-sm font-medium">Chưa có lời mời nào</p>
                </div>
              ) : (
                invites.map((inv) => (
                  <div key={inv.id} className="bg-white border border-theme-100 rounded-2xl p-5 text-left shadow-sm relative overflow-hidden">
                    <p className="text-sm font-bold text-slate-700 truncate mb-3">Từ: {inv.sender?.display_name || inv.sender_id}</p>
                    
                    {inv.message ? (
                      <p className="text-xs italic text-slate-600 bg-theme-50 p-3 rounded-xl shadow-inner mb-4">"{inv.message}"</p>
                    ) : (
                      <p className="text-[10px] italic text-slate-400 mb-4">Không có lời nhắn đi kèm.</p>
                    )}
                    
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => handleReject(inv.id)} className="flex-1 bg-white border border-theme-200 text-slate-500 py-3 rounded-xl font-bold text-xs hover:bg-theme-50 transition-colors shadow-sm">
                        {t.btnReject || 'Từ chối'}
                      </button>
                      <button onClick={() => handleAccept(inv.id, inv.sender_id)} className="flex-1 btn-cute text-white py-3 rounded-xl font-bold text-xs shadow-cute hover:scale-[1.02] transition-transform">
                        {t.btnAccept || 'Đồng ý'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ProfileModal
        locale={locale}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        myProfile={myProfile}
        session={session}
        onSaveSuccess={onProfileUpdated}
      />
    </>
  );
}