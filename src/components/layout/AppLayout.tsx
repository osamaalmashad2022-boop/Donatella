import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export function AppLayout({ children, onLogout }: AppLayoutProps) {
  return (
    <div className="page-container">
      <TopBar onLogout={onLogout} />
      <main className="px-4 py-4 md:px-6 md:py-5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
