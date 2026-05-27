'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';

const getVNTodayString = () => {
  const d = new Date();
  const vnTime = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return `${vnTime.getFullYear()}-${String(vnTime.getMonth() + 1).padStart(2, '0')}-${String(vnTime.getDate()).padStart(2, '0')}`;
};

export default function DailyPrompt({ onBack, coupleId, currentUser, partnerName, locale = 'vi' }: any) {
  const [myAnswer, setMyAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerAnswerText, setPartnerAnswerText] = useState('');
  const [hasPartnerAnswered, setHasPartnerAnswered] = useState(false);

  const t = translations[locale].dailyPrompt;
  const todayString = getVNTodayString();
  const [todayQuestion, setTodayQuestion] = useState("Đang tải dữ liệu...");

  // State cho Edit UI
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
    const { data: qDataArr } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('for_date', todayString)
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(1);

    let qData = qDataArr && qDataArr.length > 0 ? qDataArr[0] : null;

    if (!qData) {
      setTodayQuestion(t.aiThinking);
      try {
        const res = await fetch('/api/question');
        const aiData = await res.json();
        if (!res.ok) throw new Error(aiData.error || "Không kết nối được với API");

        const aiQuestion = aiData.question;

        const { data: newQData, error: dbError } = await supabase.from('daily_questions').insert([{
          for_date: todayString,
          question: aiQuestion,
          couple_id: coupleId
        }]).select().single();

        if (dbError) {
          if (dbError.code === '23505') {
            const { data: existingData } = await supabase
              .from('daily_questions')
              .select('*')
              .eq('for_date', todayString)
              .eq('couple_id', coupleId)
              .single();
            qData = existingData;
            setTodayQuestion(existingData.question);
          } else {
            throw new Error(`Lỗi lưu Database: ${dbError.message}`);
          }
        } else {
          qData = newQData;
          setTodayQuestion(aiQuestion);
        }
      } catch (err: any) {
        setTodayQuestion(`🚨 [Lỗi AI]: ${err.message}`);
      }
    } else {
      setTodayQuestion(qData.question);
    }

    if (qData) {
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

      if (mine) { setMyAnswer(mine); setIsSubmitted(true); }
      if (partners) { setHasPartnerAnswered(true); setPartnerAnswerText(partners); }
    }
  };

  const handleSubmit = async () => {
    if (!myAnswer.trim() || !currentUser?.id) return;
    setIsSubmitting(true);

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
      if (error) alert(`Lỗi Update: ${error.message}`);
      else setIsSubmitted(true);
    }

    setIsSubmitting(false);
  };

  const handleUpdateAnswer = async () => {
    if (!editContent.trim() || !currentUser?.id) return;
    setIsUpdating(true);

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
        updateData = { user1_answer: editContent.trim() };
      } else if (qData.user2_id === currentUser.id) {
        updateData = { user2_answer: editContent.trim() };
      }

      const { error } = await supabase.from('daily_questions').update(updateData).eq('id', qData.id);

      if (!error) {
        setIsEditing(false);
        setMyAnswer(editContent.trim());
      } else {
        alert(`Lỗi Update: ${error.message}`);
      }
    }
    setIsUpdating(false);
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

        {/* PARTNER ANSWER */}
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
            <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-2xl italic">
              Hãy trả lời câu hỏi để xem đáp án của {partnerName || 'người ấy'} nhé!
            </p>
          )}
        </div>

        {/* MY ANSWER */}
        <div className="bg-white border border-theme-100 p-4 md:p-5 rounded-3xl shadow-sm">
          <p className="text-[11px] font-bold text-theme-400 mb-3 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-theme-400"></span>
            {t.yourAnswer}
          </p>
          {isSubmitted ? (
            <div className="relative">
              {isEditing ? (
                <div className="space-y-3 animate-fade-in">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm outline-none focus:ring-2 transition-all resize-none min-h-[100px] bg-white text-slate-700 focus:ring-theme-200 shadow-inner custom-scrollbar"
                    placeholder="Nhập câu trả lời của bạn..."
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-slate-100 text-slate-500 hover:bg-slate-200"
                    >
                      {t.btnCancelUpdate}
                    </button>
                    <button
                      onClick={handleUpdateAnswer}
                      disabled={isUpdating}
                      className="btn-cute px-6 py-2 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
                    >
                      {isUpdating ? t.btnSavingUpdate : t.btnSaveUpdate}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-sm text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl leading-relaxed pr-12 border border-slate-100">
                    {myAnswer}
                  </p>
                  
                  {/* ĐÃ FIX: NÚT SỬA LUÔN HIỂN THỊ */}
                  <button
                    onClick={() => {
                      setEditContent(myAnswer);
                      setIsEditing(true);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/5 text-slate-400 hover:text-theme-500 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-theme-400 transition-all resize-none custom-scrollbar shadow-inner text-slate-700"
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