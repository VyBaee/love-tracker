'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { translations, Locale } from '../lib/translations';
import { compressImage } from '../lib/imageUtils'; // Import hàm nén ảnh

const PAGE_SIZE = 5;

export default function MemoryTimeline({ onBack, coupleId, currentUser, locale = 'vi' }: any) {
  const [memories, setMemories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<any>(null);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(true);

  const t = translations[locale].memoryTimeline;

  // Form states cơ bản
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);

  // Quản lý trạng thái Ảnh Cũ (từ DB) và Ảnh Mới (vừa chọn)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => { fetchMemories(); }, [limit, coupleId]);

  useEffect(() => {
    const channel = supabase.channel('public:memories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories', filter: `couple_id=eq.${coupleId}` }, () => { fetchMemories(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [coupleId]);

  const fetchMemories = async () => {
    setIsLoading(true);
    const { data, count } = await supabase.from('memories').select('*, author:profiles!user_id(display_name, avatar_url)', { count: 'exact' }).eq('couple_id', coupleId).order('memory_date', { ascending: false }).order('created_at', { ascending: false }).range(0, limit - 1);
    if (data) { setMemories(data); setHasMore(count ? count > limit : false); }
    setIsLoading(false);
  };

  const handleToggleLike = async (memory: any) => {
    if (!currentUser?.id) return;
    const likedByArray = memory.liked_by || [];
    const isLiked = likedByArray.includes(currentUser.id);
    const newLikedBy = isLiked ? likedByArray.filter((id: string) => id !== currentUser.id) : [...likedByArray, currentUser.id];
    setMemories(memories.map(m => m.id === memory.id ? { ...m, liked_by: newLikedBy } : m));
    await supabase.from('memories').update({ liked_by: newLikedBy }).eq('id', memory.id);
  };

  const openEditModal = (memory: any) => {
    setEditingMemory(memory);
    setTitle(memory.title);
    setDescription(memory.description);
    setLocation(memory.location || '');
    setMemoryDate(memory.memory_date);

    // Đưa ảnh cũ vào danh sách quản lý
    const urls = memory.image_urls?.length > 0 ? memory.image_urls : (memory.image_url ? [memory.image_url] : []);
    setExistingImages(urls);
    setNewFiles([]);
    setNewPreviews([]);

    setIsModalOpen(true);
  };

  // --- LOGIC XỬ LÝ ẢNH MỚI ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const addedFiles = Array.from(e.target.files);
      
      if (existingImages.length + newFiles.length + addedFiles.length > 10) {
        setUploadError(t.maxImagesError); 
        setTimeout(() => setUploadError(null), 3000);
        return;
      }
      
      setUploadError(null);
      setNewFiles([...newFiles, ...addedFiles]);
      setNewPreviews([...newPreviews, ...addedFiles.map(file => URL.createObjectURL(file))]);
    }
  };

  // Hàm xoá ảnh cũ (đã có trên DB)
  const handleRemoveExisting = (idx: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  // Hàm xoá ảnh mới (vừa chọn thêm)
  const handleRemoveNew = (idx: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== idx));
    setNewPreviews(newPreviews.filter((_, i) => i !== idx));
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setUploading(true);

    // Giữ lại các URL của ảnh cũ chưa bị xoá
    let finalImageUrls = [...existingImages];

    // Upload các file ảnh mới (có nén)
    if (newFiles.length > 0) {
      const urls = await Promise.all(newFiles.map(async (file) => {
        // Tích hợp NÉN ẢNH
        const compressedFile = await compressImage(file);

        const fileName = `${coupleId}/${Date.now()}-${Math.random().toString(36).substring(7)}-${compressedFile.name}`;
        const { error } = await supabase.storage.from('memories').upload(fileName, compressedFile);
        if (!error) return supabase.storage.from('memories').getPublicUrl(fileName).data.publicUrl;
        return null;
      }));
      finalImageUrls = [...finalImageUrls, ...(urls.filter(url => url !== null) as string[])];
    }

    if (editingMemory) {
      await supabase.from('memories').update({ title, description, location, image_urls: finalImageUrls, memory_date: memoryDate }).eq('id', editingMemory.id);
    } else {
      await supabase.from('memories').insert([{ couple_id: coupleId, user_id: currentUser.id, title, description, location, image_urls: finalImageUrls, memory_date: memoryDate, liked_by: [] }]);
    }
    resetForm(); fetchMemories();
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setLocation('');
    setExistingImages([]); setNewFiles([]); setNewPreviews([]);
    setEditingMemory(null); setIsModalOpen(false); setUploading(false);
  };

  const handleDeleteClick = (id: string) => { setMemoryToDelete(id); };
  const confirmDelete = async () => { if (!memoryToDelete) return; await supabase.from('memories').delete().eq('id', memoryToDelete); setMemoryToDelete(null); fetchMemories(); };

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-white/50 backdrop-blur-md rounded-[2.5rem] z-30 animate-fade-in overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="lg:hidden w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h2 className="font-black text-theme-600 text-lg uppercase tracking-wider">{t.title}</h2>
        </div>
        <button onClick={() => { setEditingMemory(null); resetForm(); setIsModalOpen(true); }} className="w-10 h-10 bg-theme-100 hover:bg-theme-200 text-theme-600 rounded-full flex items-center justify-center transition-colors shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6 md:p-6 space-y-6 custom-scrollbar pb-24">
        {isLoading && memories.length === 0 ? (
          <div className="text-center text-slate-400 mt-10 font-bold animate-pulse text-sm">{t.loading}</div>
        ) : memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="text-sm font-medium">{t.empty}</p></div>
        ) : (
          <div className="relative border-l-2 border-theme-100 ml-1 md:ml-4 space-y-6 md:space-y-8">
            {memories.map((memory) => {
              const isLikedByMe = memory.liked_by?.includes(currentUser?.id);
              const likeCount = memory.liked_by?.length || 0;
              const displayImages = memory.image_urls?.length > 0 ? memory.image_urls : (memory.image_url ? [memory.image_url] : []);

              return (
                <div key={memory.id} className="relative pl-5 md:pl-6 animate-fade-in">
                  <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-theme-400 rounded-full -left-[7px] md:-left-[9px] top-1.5 md:top-1 border-[3px] md:border-4 border-white shadow-sm"></div>
                  <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm border border-slate-50 relative group">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-block px-3 py-1 bg-theme-50 text-theme-600 font-bold text-[10px] uppercase tracking-wider rounded-full">{new Date(memory.memory_date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}</span>
                      {memory.location && <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-full border border-slate-100">{memory.location}</span>}
                    </div>

                    {displayImages.length > 0 && (
                      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 mb-4 pb-2 custom-scrollbar hide-scrollbar-mobile">
                        {displayImages.map((imgUrl: string, idx: number) => (
                          <div key={idx} onClick={() => setSelectedImage(imgUrl)} className="w-full shrink-0 snap-center h-64 md:h-72 bg-slate-100 rounded-xl overflow-hidden border border-slate-50 cursor-pointer">
                            <img src={imgUrl} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    )}
                    <h3 className="font-bold text-slate-700 text-lg mb-1">{memory.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 whitespace-pre-wrap">{memory.description}</p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                      <div className="flex items-center gap-2"><span className="text-[11px] font-bold text-slate-400">{memory.author?.display_name}</span></div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggleLike(memory)} className={`flex items-center gap-1.5 transition-all active:scale-150 ${isLikedByMe ? 'text-theme-500' : 'text-slate-300 hover:text-theme-400'}`}>
                          <svg className="w-5 h-5" fill={isLikedByMe ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth="2" /></svg>
                          {likeCount > 0 && <span className="text-xs font-bold">{likeCount}</span>}
                        </button>
                        {memory.user_id === currentUser?.id && (
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(memory)} className="text-slate-300 hover:text-theme-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            <button onClick={() => handleDeleteClick(memory.id)} className="text-slate-200 hover:text-red-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div className="pt-4 pb-8 flex justify-center">
                <button onClick={() => setLimit(prev => prev + PAGE_SIZE)} className="text-xs font-bold text-slate-500 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm">{t.loadMore}</button>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <form onSubmit={handleSaveMemory} className="bg-white p-6 rounded-[2rem] w-full max-w-sm shadow-cute-lg animate-fade-in relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="font-bold text-theme-600 text-xl mb-6 text-center">{editingMemory ? t.editTitle : t.addEditTitle}</h2>

            {/* --- KHU VỰC CHỌN ẢNH NÂNG CẤP --- */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest px-1">{t.imageLabel}</label>

              <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative p-3">
                {uploadError && (
                  <div className="text-red-500 text-xs font-bold text-center mt-2 animate-bounce">
                    {uploadError}
                  </div>
                )}
                {(existingImages.length > 0 || newPreviews.length > 0) ? (
                  <div className="flex flex-wrap gap-2">

                    {/* 1. Hiển thị Ảnh Cũ (từ DB) */}
                    {existingImages.map((url, idx) => (
                      <div key={`old-${idx}`} className="relative w-16 h-16 group rounded-xl overflow-hidden shadow-sm border border-slate-200">
                        <img src={url} className="w-full h-full object-cover" alt="old" />
                        <button type="button" onClick={() => handleRemoveExisting(idx)} className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110">✕</button>
                      </div>
                    ))}

                    {/* 2. Hiển thị Ảnh Mới */}
                    {newPreviews.map((url, idx) => (
                      <div key={`new-${idx}`} className="relative w-16 h-16 group rounded-xl overflow-hidden shadow-sm border border-theme-200">
                        <img src={url} className="w-full h-full object-cover" alt="new" />
                        <button type="button" onClick={() => handleRemoveNew(idx)} className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110">✕</button>
                      </div>
                    ))}

                    {/* 3. Nút Dấu + để Thêm ảnh (chỉ hiện khi chưa đủ 10 ảnh) */}
                    {(existingImages.length + newFiles.length) < 10 && (
                      <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <span className="text-2xl text-slate-400 font-light">+</span>
                        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="block text-center py-6 cursor-pointer text-slate-400 hover:text-theme-500 transition-colors">
                    <span className="text-xs font-bold">{t.clickToUpload}</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePlaceholder} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-theme-400" required />
              <input type="date" value={memoryDate} onChange={(e) => setMemoryDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none" required />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t.locationPlaceholder} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.descPlaceholder} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none resize-none" required />
            </div>

            <div className="flex gap-2 mt-6">
              <button type="button" onClick={resetForm} className="w-1/2 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl text-sm">{t.btnCancel}</button>
              <button type="submit" disabled={uploading} className="w-1/2 btn-cute py-4 text-sm shadow-cute">{uploading ? t.btnSaving : (editingMemory ? t.btnUpdate : t.btnSave)}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {memoryToDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] px-4">
          <div className="bg-white p-6 rounded-[2rem] w-full max-w-sm text-center shadow-cute-lg animate-fade-in relative">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </div>
            <h2 className="font-bold text-slate-700 text-lg mb-2">{t.deleteTitle}</h2>
            <p className="text-sm text-slate-500 mb-6 px-2">{t.deleteDesc}</p>
            <div className="flex gap-2">
              <button onClick={() => setMemoryToDelete(null)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-bold">{t.btnCancel}</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-bold shadow-sm">{t.btnDelete}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {selectedImage && typeof document !== 'undefined' && createPortal(
        <div onClick={() => setSelectedImage(null)} className="fixed inset-0 bg-slate-950/95 z-[200] flex items-center justify-center animate-fade-in cursor-zoom-out p-4">
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-up" onClick={(e) => e.stopPropagation()} alt="Full size" />
        </div>,
        document.body
      )}
    </div>
  );
}