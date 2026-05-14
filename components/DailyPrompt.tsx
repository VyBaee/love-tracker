'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';

export default function DailyPrompt({ onBack, coupleId, currentUser, partnerName, locale = 'vi' }: any) {
  const [myAnswer, setMyAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerAnswerText, setPartnerAnswerText] = useState('');
  const [hasPartnerAnswered, setHasPartnerAnswered] = useState(false);
  
  const t = translations[locale].dailyPrompt;
  const [todayQuestion, setTodayQuestion] = useState("...");
  
  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchDailyData();
    
    const channel = supabase.channel('public:daily_questions_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'daily_questions', 
        filter: `for_date=eq.${todayString}` 
      }, () => {
        fetchDailyData();
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [coupleId]);

  const fetchDailyData = async () => {
    // SỬA LỖI Ở ĐÂY: Lọc đúng coupleId, lấy dòng mới nhất và chỉ lấy 1 dòng
    const { data: qDataArr, error } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('for_date', todayString)
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) console.error("Lỗi tải data:", error.message);

    const qData = qDataArr && qDataArr.length > 0 ? qDataArr[0] : null;

    if (qData) {
      setTodayQuestion(qData.question || t.fallbackQuestion);

      let mine = null;
      let partners = null;

      if (qData.user1_id === currentUser.id) {
        mine = qData.user1_answer;
        partners = qData.user2_answer;
      } else if (qData.user2_id === currentUser.id) {
        mine = qData.user2_answer;
        partners = qData.user1_answer;
      } else {
        if (qData.user1_id && qData.user1_id !== currentUser.id) partners = qData.user1_answer;
        if (qData.user2_id && qData.user2_id !== currentUser.id) partners = qData.user2_answer;
      }

      if (mine) { 
        setMyAnswer(mine); 
        setIsSubmitted(true); 
      }
      if (partners) { 
        setHasPartnerAnswered(true); 
        setPartnerAnswerText(partners); 
      }
    } else {
      setTodayQuestion(t.fallbackQuestion);
    }
  };

  const handleSubmit = async () => {
    if (!myAnswer.trim() || !currentUser?.id) return;
    setIsSubmitting(true);
    
    // Tương tự, dùng limit(1) khi update để tránh lỗi
    const { data: qDataArr } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('for_date', todayString)
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(1);

    const qData = qDataArr && qDataArr.length > 0 ? qDataArr[0] : null;

    if (qData) {
      let updateData: any = {};
      
      if (qData.user1_id === currentUser.id) {
        updateData = { user1_answer: myAnswer.trim() };
      } else if (qData.user2_id === currentUser.id) {
        updateData = { user2_answer: myAnswer.trim() };
      } else if (!qData.user1_id) {
        updateData = { user1_id: currentUser.id, user1_answer: myAnswer.trim() };
      } else {
        updateData = { user2_id: currentUser.id, user2_answer: myAnswer.trim() };
      }

      const { error } = await supabase.from('daily_questions').update(updateData).eq('id', qData.id);

      if (error) {
        alert(`Lỗi Update: ${error.message}`);
      } else {
        setIsSubmitted(true);
      }
    } else {
      const { error } = await supabase.from('daily_questions').insert([{
        for_date: todayString,
        question: todayQuestion, // Đồng bộ câu hỏi đang hiển thị
        couple_id: coupleId,
        user1_id: currentUser.id,
        user1_answer: myAnswer.trim()
      }]);
      
      if (error) {
         alert(`Lỗi Insert: ${error.message}`);
      } else {
         setIsSubmitted(true);
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-white/50 backdrop-blur-md rounded-[2.5rem] z-30 animate-fade-in overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="lg:hidden w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h2 className="font-black text-theme-600 text-lg uppercase tracking-wider">{t.title}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-6 space-y-6 custom-scrollbar pb-24">
        <div className="bg-white rounded-3xl p-6 md:p-8 text-center shadow-sm border border-theme-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-theme-300"></div>
          <span className="text-4xl mb-4 block">💭</span>
          <p className="font-bold text-slate-700 text-base md:text-lg leading-relaxed">{todayQuestion}</p>
        </div>

        <div className="bg-white border border-slate-100 p-4 md:p-5 rounded-3xl shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            {t.partnerAnswered.replace('{name}', partnerName || 'Người ấy')}
          </p>
          
          {!hasPartnerAnswered ? (
            <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-2xl italic">{t.partnerNotAnswered}</p>
          ) : isSubmitted ? (
            <p className="text-sm text-theme-600 font-medium bg-theme-50 p-4 rounded-2xl leading-relaxed animate-fade-in">{partnerAnswerText}</p>
          ) : (
            <div className="relative">
              <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-2xl filter blur-[5px] select-none">{t.hiddenAnswer}</p>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-600 px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-theme-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  {t.replyToSee}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-theme-100 p-4 md:p-5 rounded-3xl shadow-sm">
          <p className="text-[11px] font-bold text-theme-400 mb-3 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-theme-400"></span>
            {t.yourAnswer}
          </p>
          {isSubmitted ? (
            <p className="text-sm text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl leading-relaxed">{myAnswer}</p>
          ) : (
            <div className="space-y-4">
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-theme-400 transition-all resize-none custom-scrollbar shadow-inner"
                placeholder={t.placeholder} rows={4} value={myAnswer} onChange={(e) => setMyAnswer(e.target.value)}
              ></textarea>
              <button onClick={handleSubmit} disabled={!myAnswer.trim() || isSubmitting} className={`w-full py-3.5 md:py-4 rounded-2xl font-bold transition-all shadow-sm ${myAnswer.trim() ? 'btn-cute text-white hover:scale-[1.02]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                {isSubmitting ? t.btnSubmitting : t.btnSubmit}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}