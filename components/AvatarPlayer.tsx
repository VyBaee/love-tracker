import { translations, Locale } from '../lib/translations';

interface AvatarPlayerProps {
  name: string;
  image: string;
  zodiac: string;
  age: number;
  locale?: Locale;
}

export default function AvatarPlayer({ name, image, zodiac, age, locale = 'vi' }: AvatarPlayerProps) {
  const t = translations[locale].avatarPlayer;
  
  const fallbackChar = name ? name.charAt(0).toUpperCase() : 'U';

  // Mảng hằng số để tự động dò tìm (Phòng trường hợp DB đang lỡ lưu tiếng Anh hoặc tiếng Việt)
  const viZodiacs = ["Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ", "Thiên Bình", "Bọ Cạp", "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư"];
  const enZodiacs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

  // Dò tìm vị trí cung hoàng đạo trong mảng
  let zIndex = viZodiacs.indexOf(zodiac);
  if (zIndex === -1) zIndex = enZodiacs.indexOf(zodiac); // Tìm không ra tiếng Việt thì tìm thử bằng tiếng Anh

  // Nếu tìm thấy, xuất ra màn hình đúng theo lá cờ đang chọn. Nếu không, báo "Chưa rõ"
  let displayZodiac = t?.unknownZodiac || "Chưa rõ";
  if (zIndex !== -1) {
    displayZodiac = locale === 'vi' ? viZodiacs[zIndex] : enZodiacs[zIndex];
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full border-4 border-white shadow-cute overflow-hidden mb-3 bg-slate-100 flex items-center justify-center relative group">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-bold text-slate-300">
            {fallbackChar}
          </span>
        )}
      </div>
      
      <p className="font-bold text-theme-600 text-lg">{name || t?.loading || 'Đang tải...'}</p>
      
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-full shadow-sm">
          {displayZodiac}
        </span>
        <span className="text-[10px] text-white font-bold bg-theme-400 px-2 py-0.5 rounded-full shadow-sm">
          {age > 0 ? (t?.age ? t.age.replace('{age}', age.toString()) : `${age} tuổi`) : (t?.unknownAge || '???')}
        </span>
      </div>
    </div>
  );
}