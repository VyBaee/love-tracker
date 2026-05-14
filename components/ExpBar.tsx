import { translations, Locale } from '../lib/translations';

interface ExpBarProps {
  daysRemaining: number;
  nextAnniversaryYear: number;
  progressWidth: number;
  locale?: Locale;
}

export default function ExpBar({ daysRemaining, nextAnniversaryYear, progressWidth, locale = 'vi' }: ExpBarProps) {
  const t = translations[locale].expBar;
  
  return (
    <div className="mb-6 w-full px-4">
      <div className="flex justify-between items-end text-xs font-bold text-slate-400 mb-2 px-1">
        <span>{t.anniversary} <span className="text-theme-500 text-sm">{nextAnniversaryYear} {t.year}</span></span>
        <span className="text-theme-500 bg-theme-50 px-3 py-1 rounded-full shadow-sm">
          {t.daysLeft.replace('{count}', daysRemaining.toString())}
        </span>
      </div>
      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{ 
            width: `${progressWidth}%`,
            backgroundColor: 'var(--theme-primary)',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
          }}
        >
        </div>
      </div>
    </div>
  );
}