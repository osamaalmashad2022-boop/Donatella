import { useAppStore } from '@/store/appStore';
import type { AppPage } from '@/types';
import {
  LayoutDashboard,
  Wheat,
  CookingPot,
  BarChart3,
  Database,
} from 'lucide-react';

const navItems: { id: AppPage; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',   label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'ingredients', label: 'المكونات', icon: Wheat },
  { id: 'recipes',     label: 'الوصفات',  icon: CookingPot },
  { id: 'analytics',   label: 'التحليل',  icon: BarChart3 },
  { id: 'data',        label: 'البيانات', icon: Database },
];

export function BottomNav() {
  const { activePage, setActivePage } = useAppStore();

  return (
    <nav className="bottom-nav" id="main-nav">
      {/* Desktop brand (visible only on lg+) */}
      <div className="hidden lg:flex items-center gap-3 px-4 pb-6 mb-4 border-b border-border/30 w-full">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 flex-shrink-0">
          <CookingPot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold bg-gradient-to-l from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Donatella
          </h1>
          <p className="text-[10px] text-muted-foreground">محرك تسعير الوصفات</p>
        </div>
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => setActivePage(item.id)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-wrap">
              <Icon className="h-5 w-5" />
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
