'use client';

import { useState, useEffect } from 'react';
import { translations, Locale } from '../lib/translations';

export default function SettingsModal({ isOpen, onClose, currentData, onSave, locale = 'vi' }: any) {
  const [startDate, setStartDate] = useState('');
  const [theme, setTheme] = useState('#ec4899');
  const [isSaving, setIsSaving] = useState(false);
  const t = translations[locale].settingsModal;

  useEffect(() => {
    if (isOpen && currentData) {
      setStartDate(currentData.startDate || '');
      setTheme(currentData.theme || '#ec4899');
    }
  }, [isOpen, currentData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ startDate, theme });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-cute-lg animate-fade-in relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        <h2 className="font-black text-slate-700 text-2xl mb-6 text-center">{t.title}</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">{t.startDate}</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-theme-400 transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">{t.themeColor}</label>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <input type="color" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none p-0 outline-none" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-600">{t.hexCode.replace('{color}', theme.toUpperCase())}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button onClick={handleSave} disabled={isSaving} className="w-full py-4 rounded-2xl text-sm font-bold shadow-sm text-white transition-transform hover:scale-[1.02]" style={{ backgroundColor: theme }}>
            {isSaving ? t.btnSaving : t.btnSave}
          </button>
        </div>
      </div>
    </div>
  );
}