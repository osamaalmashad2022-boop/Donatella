import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { auth } from '@/lib/firebase';
import { LogOut, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

import { InstallPrompt } from '@/components/pwa/InstallPrompt';

const PAGE_TITLES: Record<string, string> = {
  dashboard:   'الرئيسية',
  ingredients: 'إدارة المكونات',
  recipes:     'الوصفات والتسعير',
  analytics:   'تحليل الربحية',
  data:        'البيانات والتصدير',
};

interface TopBarProps {
  onLogout?: () => void;
}

export function TopBar({ onLogout }: TopBarProps) {
  const activePage = useAppStore((s) => s.activePage);
  const title = PAGE_TITLES[activePage] || 'الرئيسية';
  const user = auth.currentUser;
  const [isLogoZoomed, setIsLogoZoomed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="top-bar">
        {/* Mobile brand / Logo */}
        <button 
          onClick={() => setIsLogoZoomed(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md shadow-amber-500/20 flex-shrink-0 relative overflow-hidden ring-1 ring-amber-500/20 hover:scale-105 transition-transform cursor-pointer"
        >
          <img src="/logo.png" alt="Donatella" className="w-full h-full object-cover" />
        </button>

      <div className="flex-1 min-w-0">
        <h2 className="text-base font-bold tracking-tight truncate">{title}</h2>
        <p className="text-[10px] text-muted-foreground lg:hidden">Donatella</p>
      </div>

      {/* User avatar + logout */}
      {user && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <InstallPrompt />
          
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'المستخدم'}
              className="h-8 w-8 rounded-full border-2 border-amber-500/30 object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="تبديل المظهر"
            title="تبديل المظهر"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>
          
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}
      </header>

      {/* Logo Popup Modal */}
      {isLogoZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in zoom-in-95" onClick={() => setIsLogoZoomed(false)}>
          <div className="relative group p-4" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-12 -left-4 sm:-right-12 sm:left-auto text-white/70 hover:text-amber-500 transition-colors p-2" 
              onClick={() => setIsLogoZoomed(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <img src="/logo.png" alt="Donatella Logo Zoomed" className="w-64 h-64 sm:w-96 sm:h-96 object-contain rounded-3xl shadow-2xl shadow-amber-500/50 ring-1 ring-amber-500/20 bg-background" />
          </div>
        </div>
      )}
    </>
  );
}
