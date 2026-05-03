import { useState } from 'react';
import { CookingPot } from 'lucide-react';

interface LoginPageProps {
  onSignIn: () => Promise<void>;
}

export function LoginPage({ onSignIn }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await onSignIn();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('تم إغلاق نافذة تسجيل الدخول');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('هذا النطاق غير مصرح به. أضفه في Firebase Console');
      } else {
        setError('فشل تسجيل الدخول. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full bg-amber-500/8 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/3 w-[200px] h-[200px] rounded-full bg-orange-500/5 blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full animate-fade-in">
        {/* Logo */}
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/30 mb-6 animate-float">
          <CookingPot className="h-10 w-10 text-white" />
        </div>

        {/* Brand */}
        <h1 className="text-3xl font-bold bg-gradient-to-l from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-2">
          Donatella
        </h1>
        <p className="text-muted-foreground text-sm mb-1">
          محرك تسعير الوصفات الاحترافي
        </p>
        <p className="text-muted-foreground/60 text-xs mb-10">
          Professional Recipe Costing Engine
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 w-full mb-10">
          {[
            { icon: '📊', label: 'تحليل التكلفة' },
            { icon: '📈', label: 'هندسة القائمة' },
            { icon: '♻️', label: 'تتبع الهدر' },
            { icon: '☁️', label: 'حفظ سحابي' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card/50 border border-border/30"
            >
              <span className="text-lg">{f.icon}</span>
              <span className="text-xs font-medium">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Google Sign-in Button */}
        <button
          id="google-sign-in-btn"
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-gray-800 font-bold text-sm shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>{loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول بـ Google'}</span>
        </button>

        {/* Error */}
        {error && (
          <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 w-full text-center">
            {error}
          </p>
        )}

        {/* Footer */}
        <p className="mt-8 text-[10px] text-muted-foreground/40">
          بياناتك محفوظة بأمان على Firebase ☁️
        </p>
      </div>
    </div>
  );
}
