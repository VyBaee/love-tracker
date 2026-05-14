'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';
import { compressImage } from '../lib/imageUtils';

export default function ProfileModal({ isOpen, onClose, myProfile, session, onSaveSuccess, locale = 'vi' }: any) {
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const t = translations[locale].profileModal;

  useEffect(() => {
    if (isOpen && myProfile) {
      setEditName(myProfile.display_name || '');
      setEditDob(myProfile.dob || '');
      setAvatarPreview(myProfile.avatar_url || '');
    }
  }, [isOpen, myProfile]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  setUploading(true);
  let finalAvatarUrl = myProfile.avatar_url;

  if (editAvatar) {
    const compressedFile = await compressImage(editAvatar);
    
    const fileName = `${session.user.id}-${Date.now()}.${editAvatar.name.split('.').pop()}`;
    
    const { error } = await supabase.storage.from('avatars').upload(fileName, compressedFile);
    
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      finalAvatarUrl = data.publicUrl;
    }
  }

    const getZodiac = (dob: string) => {
      const date = new Date(dob), d = date.getDate(), m = date.getMonth() + 1;
      // FIX CỨNG: Luôn lưu dữ liệu gốc vào Database bằng Tiếng Việt
      if ((m == 3 && d >= 21) || (m == 4 && d <= 19)) return "Bạch Dương";
      if ((m == 4 && d >= 20) || (m == 5 && d <= 20)) return "Kim Ngưu";
      if ((m == 5 && d >= 21) || (m == 6 && d <= 21)) return "Song Tử";
      if ((m == 6 && d >= 22) || (m == 7 && d <= 22)) return "Cự Giải";
      if ((m == 7 && d >= 23) || (m == 8 && d <= 22)) return "Sư Tử";
      if ((m == 8 && d >= 23) || (m == 9 && d <= 22)) return "Xử Nữ";
      if ((m == 9 && d >= 23) || (m == 10 && d <= 23)) return "Thiên Bình";
      if ((m == 10 && d >= 24) || (m == 11 && d <= 21)) return "Bọ Cạp";
      if ((m == 11 && d >= 22) || (m == 12 && d <= 21)) return "Nhân Mã";
      if ((m == 12 && d >= 22) || (m == 1 && d <= 19)) return "Ma Kết";
      if ((m == 1 && d >= 20) || (m == 2 && d <= 18)) return "Bảo Bình";
      return "Song Ngư";
    };

    await supabase.from('profiles').update({
      display_name: editName, dob: editDob, avatar_url: finalAvatarUrl, zodiac: getZodiac(editDob)
    }).eq('id', session.user.id);
    
    setUploading(false);
    onSaveSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[150] px-4">
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl w-full max-w-sm text-center shadow-cute-lg animate-fade-in relative">
        <h2 className="font-bold text-theme-600 mb-6 text-lg">{t.title}</h2>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full border-4 border-theme-50 shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center mb-3 relative group">
            {avatarPreview ? (
              <img src={avatarPreview} className="w-full h-full object-cover"/>
            ) : (
              <span className="text-slate-400 font-bold">{editName.charAt(0) || 'U'}</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-white text-xs font-bold">{t.changePhoto}</span>
            </div>
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { setEditAvatar(f); setAvatarPreview(URL.createObjectURL(f)); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{session.user.email}</p>
        </div>

        <div className="text-left space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 px-1">{t.labelName}</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder={t.placeholderName} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-theme-400 transition-all" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 px-1">{t.labelDob}</label>
            <input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-theme-400 transition-all" required />
          </div>
        </div>

        <div className="flex gap-2 mt-8">
          <button type="button" onClick={onClose} className="w-1/2 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl text-sm transition-colors hover:bg-slate-200">{t.btnCancel}</button>
          <button type="submit" disabled={uploading} className="w-1/2 btn-cute py-4 text-sm disabled:opacity-50">
            {uploading ? t.btnSaving : t.btnSave}
          </button>
        </div>
      </form>
    </div>
  );
}