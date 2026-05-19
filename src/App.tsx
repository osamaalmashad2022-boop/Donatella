import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoginPage } from '@/components/auth/LoginPage';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { IngredientPage } from '@/components/ingredients/IngredientPage';
import { RecipePage } from '@/components/recipes/RecipePage';
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage';
import { DataBackupPage } from '@/components/data/DataBackupPage';
import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';
import { CookingPot } from 'lucide-react';

function App() {
  const activePage = useAppStore((s) => s.activePage);
  const { user, loading, signInWithGoogle, logout } = useAuth();

  // Auth loading screen
  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/25 animate-float">
          <CookingPot className="h-7 w-7 text-white" />
        </div>
        <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <>
        <LoginPage onSignIn={signInWithGoogle} />
        <Toaster position="top-center" dir="rtl" />
      </>
    );
  }

  // Logged in — show app
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'ingredients':
        return <IngredientPage />;
      case 'recipes':
        return <RecipePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'data':
        return <DataBackupPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <AppLayout onLogout={logout}>
        <ErrorBoundary>{renderPage()}</ErrorBoundary>
      </AppLayout>
      <Toaster position="top-center" dir="rtl" />
    </>
  );
}

export default App;
