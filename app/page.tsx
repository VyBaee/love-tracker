'use client';

import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import AvatarPlayer from '../components/AvatarPlayer';
import ExpBar from '../components/ExpBar';
import SettingsModal from '../components/SettingsModal';
import MemoryTimeline from '../components/MemoryTimeline';
import DailyPrompt from '../components/DailyPrompt';
import BucketList from '../components/BucketList';
import FloatingHearts from '../components/FloatingHearts';
import Auth from '../components/Auth';
import SingleDashboard from '../components/SingleDashboard';
import ProfileModal from '../components/ProfileModal';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const getAge = (dob: string) => {
  if (!dob) return 0;
  const t = new Date(), b = new Date(dob);
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
  return age;
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [myProfile, setMyProfile] = useState<any>(null);
  const [coupleData, setCoupleData] = useState<any>(null);

  const [appData, setAppData] = useState<any>({ startDate: '', theme: '#ec4899', myName: '' });
  const [currentView, setCurrentView] = useState<'home' | 'memories' | 'prompts' | 'bucket_list'>('home');
  const [daysCount, setDaysCount] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [nextAnniYear, setNextAnniYear] = useState(1);
  const [progressWidth, setProgressWidth] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [showUnpairConfirm, setShowUnpairConfirm] = useState(false);
  const [showUnpairSent, setShowUnpairSent] = useState(false);
  const [showUnpairPopup, setShowUnpairPopup] = useState(false);
  const [unpairLoading, setUnpairLoading] = useState(false);

  const [myMood, setMyMood] = useState('🥰');
  const [partnerMood, setPartnerMood] = useState('😴');
  const [showMoodMenu, setShowMoodMenu] = useState(false);
  const moods = ['🥰', '😊', '😢', '😠', '😴', '🤒'];

  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('user_locale') as Locale) || 'vi';
    }
    return 'vi';
  });

  // Tạo một hàm đổi ngôn ngữ mới để lưu luôn vào máy
  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('user_locale', newLocale);
  };

  const t = translations[locale]; // Biến t để truy xuất nhanh

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const fetchAppData = async () => {
    if (!session) return;
    setIsLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      await supabase.auth.signOut();
      setSession(null);
      setIsLoading(false);
      return;
    }

    let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) {
      const registeredName = user.user_metadata?.username || user.email?.split('@')[0];
      const { data: newProfile } = await supabase.from('profiles').insert([{ id: user.id, email: user.email, display_name: registeredName }]).select().single();
      profile = newProfile;
    }
    setMyProfile(profile);

    const { data: couples } = await supabase.from('couples')
      .select('*, p1:profiles!user1_id(*), p2:profiles!user2_id(*)')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .limit(1);

    if (couples && couples.length > 0) {
      setCoupleData(couples[0]);
      const isUser1 = couples[0].user1_id === user.id;
      const me = isUser1 ? couples[0].p1 : couples[0].p2;
      const partner = isUser1 ? couples[0].p2 : couples[0].p1;

      setMyMood(me?.current_mood || '🥰');
      setPartnerMood(partner?.current_mood || '😴');

      setAppData({
        startDate: couples[0].start_date, theme: couples[0].theme || '#ec4899',
        myName: me?.display_name, myDob: me?.dob, myImage: me?.avatar_url, myZodiac: me?.zodiac,
        partnerName: partner?.display_name, partnerDob: partner?.dob, partnerImage: partner?.avatar_url, partnerZodiac: partner?.zodiac,
      });
      if (couples[0].unpair_request_by && couples[0].unpair_request_by !== user.id) setShowUnpairPopup(true);
    } else {
      setCoupleData(null);
      setAppData({ startDate: '', theme: '#ec4899', myName: profile?.display_name || '' });
      setShowUnpairPopup(false);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchAppData(); }, [session]);

  const confirmRequestUnpair = async () => {
    setUnpairLoading(true);
    if (coupleData && session?.user.id) {
      await supabase.from('couples').update({ unpair_request_by: session.user.id }).eq('id', coupleData.id);
      setUnpairLoading(false);
      setShowUnpairConfirm(false);
      setShowUnpairSent(true);
    }
  };

  const handleAcceptUnpair = async () => {
    setUnpairLoading(true);
    await supabase.from('couples').delete().eq('id', coupleData.id);
    setUnpairLoading(false);
    setShowUnpairPopup(false);
    fetchAppData();
  };

  const handleRejectUnpair = async () => {
    setUnpairLoading(true);
    await supabase.from('couples').update({ unpair_request_by: null }).eq('id', coupleData.id);
    setUnpairLoading(false);
    setShowUnpairPopup(false);
    fetchAppData();
  };

  useEffect(() => {
    if (!appData.startDate) return;
    const calcTime = () => {
      const start = new Date(appData.startDate), today = new Date(), msPerDay = 86400000;
      setDaysCount(Math.max(0, Math.floor((today.getTime() - start.getTime()) / msPerDay)));

      let nextAnni = new Date(start); nextAnni.setFullYear(today.getFullYear());
      if (today.getTime() > nextAnni.getTime() && today.toDateString() !== nextAnni.toDateString()) nextAnni.setFullYear(today.getFullYear() + 1);

      setNextAnniYear(nextAnni.getFullYear() - start.getFullYear());
      setDaysRemaining(Math.ceil((nextAnni.getTime() - today.getTime()) / msPerDay));

      let lastAnni = new Date(nextAnni); lastAnni.setFullYear(nextAnni.getFullYear() - 1);
      if (lastAnni.getTime() < start.getTime()) lastAnni = new Date(start);

      let progress = (Math.ceil((today.getTime() - lastAnni.getTime()) / msPerDay) / Math.ceil((nextAnni.getTime() - lastAnni.getTime()) / msPerDay)) * 100;
      setProgressWidth(Math.min(Math.max(progress, 0), 100));
    };
    calcTime(); const int = setInterval(calcTime, 60000); return () => clearInterval(int);
  }, [appData.startDate]);

  useEffect(() => {
    if (isLoading || !session || !coupleData || !myProfile) return;

    const tutorialKey = `love_tracker_tutorial_${session.user.id}`;
    const hasSeenTutorial = myProfile?.has_seen_tutorial;

    if (!hasSeenTutorial) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        popoverClass: 'no-arrow',
        nextBtnText: 'Tiếp ➔<br><span class="en-btn">Next</span>',
        prevBtnText: '⬅ Lùi<br><span class="en-btn">Back</span>',
        doneBtnText: 'Bắt đầu!<br><span class="en-btn">Let\'s go!</span>',
        
        onHighlightStarted: (element) => {
          if (!element) return;
          if (element.id === 'unpair-btn') return;
          const rect = element.getBoundingClientRect();
          const isOutOfViewport = rect.top < 100 || rect.bottom > window.innerHeight - 100;
          if (isOutOfViewport) {
            setTimeout(() => {
              const targetY = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);
              window.scrollTo({ top: targetY, behavior: 'smooth' });
            }, 50);
          }
        },

        steps: [
          { element: '#memory-btn', popover: { 
            title: '<div class="vi-title">Góc Kỷ Niệm</div><div class="en-title">Memories</div>', 
            description: '<div class="vi-desc">Nơi lưu giữ những bức ảnh dìm hàng của 2 đứa.</div><div class="en-desc">A place to keep our funniest photos.</div>', 
            side: "top", align: 'center' 
          } },
          { element: '#question-btn', popover: { 
            title: '<div class="vi-title">Câu Hỏi Hàng Ngày</div><div class="en-title">Daily Prompts</div>', 
            description: '<div class="vi-desc">Mỗi ngày 1 câu hỏi. Phải trả lời mới xem được đáp án của người kia!</div><div class="en-desc">Answer the daily question to see your partner\'s response!</div>', 
            side: "top", align: 'center' 
          } },
          { element: '#bucket-btn', popover: { 
            title: '<div class="vi-title">Ước Nguyện</div><div class="en-title">Bucket List</div>', 
            description: '<div class="vi-desc">Viết ra những điều muốn làm chung cùng nhau.</div><div class="en-desc">Write down things we want to do together.</div>', 
            side: "top", align: 'center' 
          } },
          { element: '#setting-btn', popover: { 
            title: '<div class="vi-title">Cài Đặt</div><div class="en-title">Settings</div>', 
            description: '<div class="vi-desc">Đổi màu nền và cài ngày bắt đầu của 2 bạn ở đây nè.</div><div class="en-desc">Change the background color and set the start date for both of you here.</div>', 
            side: "top", align: 'center' 
          } },
          { element: '#unpair-btn', popover: { 
            title: '<div class="vi-title">Huỷ Ghép</div><div class="en-title">Unpair</div>', 
            description: '<div class="vi-desc">Hy vọng 2 bạn KHÔNG BAO GIỜ phải dùng đến nút này!</div><div class="en-desc">Hopefully, you will NEVER have to use this button!</div>', 
            side: "top", align: 'end' 
          } },
        ],
        onDestroyStarted: async () => {
          localStorage.setItem(tutorialKey, 'true');
          await supabase.from('profiles').update({ has_seen_tutorial: true }).eq('id', session.user.id);
          setMyProfile((prev: any) => ({ ...prev, has_seen_tutorial: true }));
          driverObj.destroy();
        }
      });

      setTimeout(() => { driverObj.drive(); }, 1000); 
    }
  }, [isLoading, session, coupleData, myProfile]);

  const handleMoodChange = async (m: string) => {
    setMyMood(m);
    setShowMoodMenu(false);
    if (session?.user?.id) {
      await supabase.from('profiles').update({ current_mood: m }).eq('id', session.user.id);
    }
  };

  if (!session) return <Auth />;
  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-pulse w-10 h-10 bg-slate-200 rounded-full"></div></div>;

  const displayName = appData.myName || myProfile?.display_name || 'Người dùng';

  return (
    <main
      style={{ '--theme-primary': appData.theme || '#ec4899', backgroundColor: `${appData.theme || '#ec4899'}0A` } as any}
      className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-sans"
    >
      <div style={{ backgroundColor: appData.theme || '#ec4899' }} className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div style={{ backgroundColor: appData.theme || '#ec4899' }} className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <FloatingHearts />

      {/* NÚT HUỶ GHÉP ĐÔI (FAB) */}
      {coupleData && (
        <button
          id="unpair-btn"
          onClick={() => setShowUnpairConfirm(true)}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-white/40 hover:bg-red-50 backdrop-blur-md border border-white/50 text-red-400 shadow-sm transition-all hover:scale-110 group flex items-center gap-2"
        >
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap hidden lg:block">{t.profile.unpair}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        </button>
      )}

      {/* MODAL XÁC NHẬN HUỶ */}
      {showUnpairConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-cute-lg animate-fade-in relative">
            <h2 className="font-black text-slate-700 text-xl mb-2">{t.unpairModal.confirmTitle}</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{t.unpairModal.confirmDesc}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowUnpairConfirm(false)} className="flex-1 bg-slate-50 text-slate-500 py-4 rounded-2xl text-xs font-bold">{t.unpairModal.btnCancel}</button>
              <button onClick={confirmRequestUnpair} disabled={unpairLoading} className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-xs font-bold">{t.unpairModal.btnConfirm}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BÁO ĐÃ GỬI */}
      {showUnpairSent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-cute-lg animate-fade-in">
            <h2 className="font-black text-slate-700 text-xl mb-2">{t.unpairModal.sentTitle}</h2>
            <p className="text-sm text-slate-500 mb-6">{t.unpairModal.sentDesc}</p>
            <button onClick={() => setShowUnpairSent(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold">{t.unpairModal.btnUnderstand}</button>
          </div>
        </div>
      )}

      {/* MODAL ĐỐI PHƯƠNG NHẬN ĐƯỢC */}
      {showUnpairPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-cute-lg animate-fade-in relative border-t-4 border-red-400">
            <h2 className="font-black text-slate-700 text-xl mb-2">{t.unpairModal.receiveTitle}</h2>
            <p className="text-sm text-slate-500 mb-6">{t.unpairModal.receiveDesc}</p>
            <div className="flex gap-3">
              <button onClick={handleRejectUnpair} disabled={unpairLoading} className="flex-1 bg-slate-50 text-slate-500 py-4 rounded-2xl text-xs font-bold">{t.unpairModal.btnReject}</button>
              <button onClick={handleAcceptUnpair} disabled={unpairLoading} className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-xs font-bold">{t.unpairModal.btnAccept}</button>
            </div>
          </div>
        </div>
      )}

      {!coupleData ? (
        <SingleDashboard
          session={session}
          myProfile={myProfile}
          onPaired={fetchAppData}
          onProfileUpdated={fetchAppData}
        />
      ) : (
        <>
          {/* MENU CÁ NHÂN GÓC PHẢI TRÊN */}
          <div className="fixed top-6 right-8 z-50 flex items-center gap-3">
            {/* Bộ chuyển ngôn ngữ */}
            <div className="flex items-center bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-slate-100 shadow-sm">
              <button
                onClick={() => setLocale('vi')}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${locale === 'vi' ? 'bg-theme-100 scale-105 shadow-sm' : 'hover:bg-slate-50 opacity-60 grayscale'}`}
                title="Tiếng Việt"
              >
                <img src="https://flagcdn.com/w40/vn.png" alt="VN" className="w-5 h-auto rounded-[2px] shadow-sm" />
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${locale === 'en' ? 'bg-theme-100 scale-105 shadow-sm' : 'hover:bg-slate-50 opacity-60 grayscale'}`}
                title="English"
              >
                <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-5 h-auto rounded-[2px] shadow-sm" />
              </button>
            </div>

            {/* Avatar */}
            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 shadow-cute overflow-hidden flex items-center justify-center hover:scale-105 transition-transform">
                {myProfile?.avatar_url ? <img src={myProfile.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : displayName.charAt(0)}
              </button>
              {showProfileMenu && (
                <div className="absolute top-14 right-0 w-52 bg-white/95 backdrop-blur-md border border-slate-50 rounded-2xl shadow-cute-lg py-2 animate-fade-in origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-sm font-bold text-slate-700 truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{session.user.email}</p>
                  </div>
                  <button onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-theme-50 transition-colors">{t.profile.edit}</button>
                  <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-theme-50 transition-colors">{t.profile.logout}</button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-md lg:max-w-5xl bg-white/80 backdrop-blur-xl p-6 lg:p-10 rounded-[2.5rem] shadow-cute relative z-10 border border-white overflow-hidden min-h-[650px] lg:h-[750px] mt-10 lg:mt-12 flex flex-col lg:flex-row gap-0 lg:gap-10">

            <div className={`w-full lg:w-[40%] h-full flex-col justify-between relative ${currentView !== 'home' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mt-6 mb-10 px-2 lg:px-0">
                  <div className="relative flex flex-col items-center">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                      <button onClick={() => setShowMoodMenu(!showMoodMenu)} className="bg-white border border-slate-100 shadow-sm px-2.5 py-1 rounded-full text-base hover:scale-110 transition-transform flex items-center gap-1">
                        {myMood}
                        <svg className="w-2.5 h-2.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      {showMoodMenu && (
                        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-cute-lg p-3 grid grid-cols-3 gap-3 z-[60] animate-fade-in border border-slate-50 w-max">
                          {moods.map(m => (
                            <button key={m} onClick={() => handleMoodChange(m)} className="hover:scale-125 transition-transform text-2xl w-8 h-8 flex items-center justify-center">{m}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <AvatarPlayer locale={locale} name={appData.myName} image={appData.myImage} zodiac={appData.myZodiac} age={getAge(appData.myDob)} />
                  </div>

                  <div className="flex flex-col items-center justify-center relative mt-[-20px]">
                    <div style={{ backgroundColor: appData.theme }} className="absolute w-20 h-20 rounded-full filter blur-xl animate-pulse opacity-20"></div>
                    <svg style={{ color: appData.theme }} className="w-12 h-12 lg:w-16 lg:h-16 drop-shadow-md z-10 animate-bounce" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  </div>

                  <div className="relative flex flex-col items-center">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-slate-50 border border-slate-100 shadow-sm px-2.5 py-1 rounded-full text-base cursor-help"
                        title={t.profile.partnerMood.replace('{name}', appData.partnerName).replace('{mood}', partnerMood)}>
                        {partnerMood}
                      </div>
                    </div>
                    <AvatarPlayer locale={locale} name={appData.partnerName} image={appData.partnerImage} zodiac={appData.partnerZodiac} age={getAge(appData.partnerDob)} />
                  </div>
                </div>

                <div className="text-center mb-8 flex flex-col items-center">
                  <h2 className="text-xs font-bold text-slate-400 mb-4 tracking-widest uppercase">{t.dashboard.daysTogether}</h2>
                  <div style={{ color: appData.theme }} className="flex items-end justify-center bg-white px-8 py-5 rounded-3xl shadow-cute-lg border border-slate-50 w-full lg:w-auto">
                    <span className="text-7xl lg:text-6xl font-black leading-none">{daysCount}</span>
                    <span className="text-xl font-bold ml-2 mb-1">{t.dashboard.day}</span>
                  </div>
                </div>

                {/* ĐÃ THÊM locale={locale} */}
                <ExpBar locale={locale} daysRemaining={daysRemaining} nextAnniversaryYear={nextAnniYear} progressWidth={progressWidth} />

                <div className="grid grid-cols-2 gap-3 mt-8">
                  <button id="memory-btn" onClick={() => setCurrentView('memories')} className="btn-cute py-3 lg:py-4 text-sm font-bold shadow-sm transition-all hover:scale-105">{t.nav.memories}</button>
                  <button id="question-btn" onClick={() => setCurrentView('prompts')} className="btn-cute py-3 lg:py-4 text-sm font-bold shadow-sm transition-all hover:scale-105">{t.nav.prompts}</button>
                  <button id="bucket-btn" onClick={() => setCurrentView('bucket_list')} className="col-span-2 btn-cute py-3 lg:py-4 text-sm font-bold shadow-sm transition-all hover:scale-105">{t.nav.bucketList}</button>
                </div>

                <div className="mt-auto pt-6">
                  <button id='setting-btn' onClick={() => setIsSettingsOpen(true)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 py-4 text-sm font-bold rounded-2xl transition-colors border border-slate-100 flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {t.nav.settings}
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-px bg-slate-100 my-4"></div>

            <div className={`w-full lg:w-[60%] h-[650px] lg:h-full relative ${currentView === 'home' ? 'hidden lg:flex' : 'flex'}`}>
              {currentView === 'home' && (
                <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in text-center p-6">
                  <svg className="w-24 h-24 mb-6 text-slate-300 opacity-80 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  <p className="font-bold tracking-widest uppercase text-[11px] text-slate-400 leading-loose">{t.dashboard.emptyState}</p>
                </div>
              )}
              {/* ĐÃ THÊM locale={locale} VÀO TẤT CẢ TÍNH NĂNG Ở ĐÂY */}
              {currentView === 'memories' && <MemoryTimeline locale={locale} onBack={() => setCurrentView('home')} coupleId={coupleData.id} currentUser={session.user} />}
              {currentView === 'prompts' && <DailyPrompt locale={locale} onBack={() => setCurrentView('home')} coupleId={coupleData.id} currentUser={session.user} partnerName={appData.partnerName} />}
              {currentView === 'bucket_list' && <BucketList locale={locale} onBack={() => setCurrentView('home')} coupleId={coupleData.id} />}
            </div>
          </div>
        </>
      )}

      {/* ĐÃ THÊM locale={locale} VÀO CÁC MODAL */}
      <SettingsModal locale={locale} isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentData={appData} onSave={async (newData: any) => {
        setAppData({ ...appData, startDate: newData.startDate, theme: newData.theme });
        await supabase.from('couples').update({ start_date: newData.startDate, theme: newData.theme }).eq('id', coupleData.id);
      }} />

      <ProfileModal locale={locale} isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} myProfile={myProfile} session={session} onSaveSuccess={fetchAppData} />
    </main>
  );
}