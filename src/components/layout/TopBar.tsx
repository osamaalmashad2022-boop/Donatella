import { useAppStore } from '@/store/appStore';
import { auth } from '@/lib/firebase';
import { CookingPot, LogOut } from 'lucide-react';

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

  return (
    <header className="top-bar">
      {/* Mobile brand */}
      <div className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/20 flex-shrink-0">
        <CookingPot className="h-4.5 w-4.5 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-base font-bold tracking-tight truncate">{title}</h2>
        <p className="text-[10px] text-muted-foreground lg:hidden">Donatella</p>
      </div>

      {/* User avatar + logout */}
      {user && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'المستخدم'}
              className="h-8 w-8 rounded-full border-2 border-amber-500/30 object-cover"
              referrerPolicy="no-referrer"
            />
          )}
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
  );
}
