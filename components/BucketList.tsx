'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';

export default function BucketList({ onBack, coupleId, locale = 'vi' }: { onBack: () => void, coupleId: string, locale?: Locale }) {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[locale].bucketList;

  useEffect(() => {
    fetchBucketList();
    const channel = supabase.channel('public:bucket_list_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bucket_list', filter: `couple_id=eq.${coupleId}` }, () => {
        fetchBucketList();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [coupleId]);

  const fetchBucketList = async () => {
    const { data } = await supabase.from('bucket_list').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false });
    if (data) setItems(data);
    setIsLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const { error } = await supabase.from('bucket_list').insert([{ couple_id: coupleId, title: newItem.trim(), is_completed: false }]);
    if (!error) { setNewItem(''); fetchBucketList(); }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, is_completed: !currentStatus } : item));
    await supabase.from('bucket_list').update({ is_completed: !currentStatus }).eq('id', id);
  };

  const deleteItem = async (id: string) => {
    await supabase.from('bucket_list').delete().eq('id', id);
    fetchBucketList();
  };

  const completedCount = items.filter(i => i.is_completed).length;
  const progress = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);

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

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.progress}</span>
            <span className="text-2xl font-black text-theme-500">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-theme-400 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleAdd} className="relative">
          <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={t.placeholder} className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-6 pr-14 text-sm outline-none focus:border-theme-400 transition-all shadow-sm" />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-theme-100 text-theme-600 rounded-xl flex items-center justify-center hover:bg-theme-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
          </button>
        </form>

        <div className="space-y-3">
          {isLoading && items.length === 0 ? (
            <p className="text-center text-slate-300 py-10 animate-pulse">{t.loading}</p>
          ) : items.map((item) => (
            <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${item.is_completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-theme-50 shadow-sm'}`}>
              <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleComplete(item.id, item.is_completed)}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.is_completed ? 'bg-theme-400 border-theme-400' : 'border-slate-300'}`}>
                  {item.is_completed && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                <span className={`text-sm font-bold ${item.is_completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{item.title}</span>
              </div>
              <button onClick={() => deleteItem(item.id)} className="text-slate-200 hover:text-red-400 p-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}