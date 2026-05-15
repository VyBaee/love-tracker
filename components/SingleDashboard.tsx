'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';
import ProfileModal from './ProfileModal';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function SingleDashboard({ session, myProfile, onPaired, onProfileUpdated }: any) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Cơ chế ngôn ngữ màn Single: Mặc định là 'vi' (cơ chế set bg color)
  const [locale, setLocale] = useState<Locale>('vi');
  const t = translations[locale].singleDashboard;

  const displayName = myProfile?.display_name || session.user.user_metadata?.username || 'Người dùng';

  useEffect(() => {
    fetchInvites();
    const channel = supabase.channel('public:pairing_invites')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pairing_invites', filter: `receiver_email=eq.${session.user.email}` }, () => {
        fetchInvites();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    const singleTutorialKey = `love_tracker_single_tutorial_${session.user.id}`;
    const hasSeenTutorial = localStorage.getItem(singleTutorialKey);

    if (!hasSeenTutorial) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        nextBtnText: 'Tiếp ➔<br><span class="en-btn">Next</span>',
        prevBtnText: '⬅ Lùi<br><span class="en-btn">Back</span>',
        doneBtnText: 'Bắt đầu!<br><span class="en-btn">Let\'s go!</span>',
        steps: [
          { popover: { 
            title: '<div class="vi-title">Xin chào</div><div class="en-title">Hello!</div>', 
            description: '<div class="vi-desc">Hướng dẫn nhanh cách rước "nửa kia" về nhà chung nhé!</div><div class="en-desc">Let\'s learn how to invite your partner here!</div>', 
            align: 'center' 
          } },
          { element: '#pair-section', popover: { 
            title: '<div class="vi-title">Ghép Đôi</div><div class="en-title">Pair Up</div>', 
            description: '<div class="vi-desc">Nhập UID của người ấy vào đây để gửi lời mời.</div><div class="en-desc">Enter their UID here to send an invite.</div>', 
            side: "bottom", align: 'center' 
          } },
          { element: '#edit-profile-btn', popover: { 
            title: '<div class="vi-title">Profile</div><div class="en-title">Profile</div>', 
            description: '<div class="vi-desc">Đổi Avatar và tên để người ấy dễ nhận ra nhé.</div><div class="en-desc">Change your avatar so they can recognize you.</div>', 
            side: "bottom", align: 'center' 
          } },
          { element: '#notification-btn', popover: { 
            title: '<div class="vi-title">Thông báo</div><div class="en-title">Notifications</div>', 
            description: '<div class="vi-desc">Lời mời ghép đôi sẽ nằm ở đây. Nhớ kiểm tra nha!</div><div class="en-desc">Your pairing invites will appear here.</div>', 
            side: "bottom", align: 'center' 
          } },
          { element: '#lang-btn', popover: { 
            title: '<div class="vi-title">Ngôn Ngữ</div><div class="en-title">Language</div>', 
            description: '<div class="vi-desc">Đây là khu vực thay đổi ngôn ngữ.</div><div class="en-desc">This is where you can change the language.</div>', 
            side: "left", align: 'center' 
          } },
        ],
        onDestroyStarted: () => {
          localStorage.setItem(singleTutorialKey, 'true');
          driverObj.destroy();
        }
      });

      setTimeout(() => { driverObj.drive(); }, 800);
    }
  }, [session?.user?.id]);

  const fetchInvites = async () => {
    const { data } = await supabase.from('pairing_invites').select('*, sender:profiles!sender_id(display_name)').eq('receiver_email', session.user.email).eq('status', 'pending');
    if (data) setInvites(data);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail === session.user.email) {
      showToast(t.toastSelf);
      return;
    }
    const { error } = await supabase.from('pairing_invites').insert([{ sender_id: session.user.id, receiver_email: inviteEmail }]);
    if (!error) {
      showToast(t.toastSuccess);
      setInviteEmail('');
      setShowInviteModal(false);
    } else {
      showToast(t.toastError);
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
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white border-2 border-theme-200 text-theme-600 px-6 py-3 rounded-2xl shadow-cute-lg z-[100] animate-bounce text-sm font-bold flex items-center gap-2 w-max max-w-[90%]">
          <span className="text-center">{toastMessage}</span>
        </div>
      )}

      {/* TOP RIGHT MENU - TÍCH HỢP CHO MÀN SINGLE (Y HỆT HÌNH ẢNH) */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-4">
        {/* Bộ chuyển ngôn ngữ (đổi cục bộ trong màn single) */}
        <div id="lang-btn" className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setLocale('vi')}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${locale === 'vi' ? 'bg-theme-100 scale-105 shadow-inner' : 'hover:bg-slate-50 opacity-60 grayscale'}`}
            title={t.labelVI}
          >
            <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="w-4 h-auto rounded-[2px] shadow-sm" />
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${locale === 'en' ? 'bg-theme-100 scale-105 shadow-inner' : 'hover:bg-slate-50 opacity-60 grayscale'}`}
            title={t.labelUS}
          >
            <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-4 h-auto rounded-[2px] shadow-sm" />
          </button>
        </div>

        {/* Nút thông báo */}
        <button
          id="notification-btn"
          onClick={() => setShowNotifModal(true)}
          className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-slate-100 shadow-cute flex items-center justify-center text-slate-400 hover:text-theme-500 hover:scale-105 transition-all relative"
          title={t.labelNotif}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          {invites.length > 0 && (
            <span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>

        {/* Avatar Dropdown */}
        <div className="relative">
          <button
            id="edit-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-cute overflow-hidden flex items-center justify-center hover:scale-105 transition-transform"
          >
            {myProfile?.avatar_url ? (
              <img src={myProfile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              displayName.charAt(0)
            )}
          </button>
          {showProfileMenu && (
            <div className="absolute top-14 right-0 w-52 bg-white/95 backdrop-blur-md border border-slate-50 rounded-2xl shadow-cute-lg py-2 animate-fade-in origin-top-right">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-sm font-bold text-slate-700 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{session.user.email}</p>
              </div>
              <button
                onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-theme-50 transition-colors"
              >
                {t.editProfileLabel || translations[locale].profile.edit}
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-theme-50 transition-colors"
              >
                {t.logoutLabel || translations[locale].profile.logout}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col h-full relative w-full max-w-md mt-6">
        <div className="w-full bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-cute border border-white overflow-hidden min-h-[550px] flex flex-col items-center justify-center animate-fade-in relative">
          <div className="text-center w-full">
            <div className="mb-6 relative inline-block">
              <div className="w-32 h-32 bg-theme-100 rounded-full flex items-center justify-center text-6xl shadow-inner mx-auto animate-blob">🏠</div>
              <span className="absolute -bottom-2 -right-2 text-3xl animate-bounce">✨</span>
            </div>
            <h2 className="text-2xl font-black text-theme-600 mb-2">{t.welcomeTitle.replace('{name}', displayName)}</h2>
            <p className="text-sm text-slate-500 font-medium mb-10 px-4 leading-relaxed">
              {t.emptyTitle}<br />
              {t.emptyDesc}
            </p>
            <button id="pair-section" onClick={() => setShowInviteModal(true)} className="btn-cute px-8 py-4 text-sm font-bold w-full shadow-cute-lg">
              {t.btnInvite}
            </button>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-cute-lg animate-fade-in relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 bg-slate-100 text-slate-400 w-8 h-8 rounded-full font-bold">✕</button>
            <h2 className="font-bold text-theme-600 text-xl mb-2 mt-4">{t.inviteModalHeader}</h2>
            <p className="text-sm text-slate-500 mb-6 px-2">{t.inviteModalDesc}</p>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder={t.invitePlaceholder} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-theme-400 shadow-inner text-center" required />
              <button type="submit" className="btn-cute w-full py-4 text-sm rounded-2xl shadow-cute">
                {t.btnSendInvite}
              </button>
            </form>
          </div>
        </div>
      )}

      {showNotifModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-[2rem] w-full max-w-sm shadow-cute-lg animate-fade-in relative min-h-[300px] flex flex-col">
            <button onClick={() => setShowNotifModal(false)} className="absolute top-4 right-4 bg-slate-100 text-slate-400 w-8 h-8 rounded-full font-bold">✕</button>
            <h2 className="font-bold text-theme-600 text-lg mb-6 text-center border-b border-slate-100 pb-4 mt-2">
              {t.notifModalHeader}
            </h2>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {invites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-10">
                  <p className="text-sm font-medium">{t.notifModalEmpty}</p>
                </div>
              ) : (
                invites.map((inv) => (
                  <div key={inv.id} className="bg-theme-50 border border-theme-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-theme-500 mb-1">
                      {t.notifItemHeader}
                    </p>
                    <p className="text-sm font-bold text-slate-700 mb-3 truncate">
                      {t.fromText.replace('{name}', inv.sender?.display_name || inv.sender_id)}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleReject(inv.id)} className="flex-1 bg-white border border-red-200 text-red-500 py-2.5 rounded-xl font-bold text-xs">
                        {translations[locale].singleDashboard.btnReject || 'Từ chối'}
                      </button>
                      <button onClick={() => handleAccept(inv.id, inv.sender_id)} className="flex-1 btn-cute py-2.5 rounded-xl font-bold text-xs shadow-sm">
                        {translations[locale].singleDashboard.btnAccept || 'Đồng ý'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        locale={locale} // Truyền locale cục bộ vào modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        myProfile={myProfile}
        session={session}
        onSaveSuccess={onProfileUpdated}
      />
    </>
  );
}