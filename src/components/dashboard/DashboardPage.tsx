import { useMemo } from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import { useRecipes } from '@/hooks/useRecipes';
import { useAppStore } from '@/store/appStore';
import { calculateFullBreakdown, formatCurrency, formatPercentage } from '@/lib/calculations';
import {
  Wheat,
  CookingPot,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';
import { TypewriterText } from '../ui/TypewriterText';

export function DashboardPage() {
  const { ingredients, ingredientsMap } = useIngredients();
  const { recipes } = useRecipes();
  const setActivePage = useAppStore((s) => s.setActivePage);

  const analytics = useMemo(() => {
    const breakdowns = recipes
      .filter((r) => !r.isSubRecipe)
      .map((r) => ({
        recipe: r,
        breakdown: calculateFullBreakdown(
          r.ingredients,
          ingredientsMap,
          r.packagingCost,
          r.overheadPercentage,
          r.profitMarginPercentage,
          r.servings
        ),
      }));

    const sorted = [...breakdowns].sort(
      (a, b) => b.breakdown.netProfit - a.breakdown.netProfit
    );

    const avgProfit =
      breakdowns.length > 0
        ? breakdowns.reduce((s, b) => s + b.breakdown.netProfit, 0) / breakdowns.length
        : 0;

    const avgCost =
      breakdowns.length > 0
        ? breakdowns.reduce((s, b) => s + b.breakdown.totalCost, 0) / breakdowns.length
        : 0;

    const lowMargin = breakdowns.filter(
      (b) => b.breakdown.profitMarginPercentage < 15 && b.breakdown.totalCost > 0
    );

    return {
      breakdowns,
      topRecipes: sorted.slice(0, 5),
      avgProfit,
      avgCost,
      lowMargin,
      highestProfit: sorted[0] || null,
    };
  }, [recipes, ingredientsMap]);

  const stats = [
    {
      label: 'المكونات',
      value: ingredients.length,
      icon: Wheat,
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/20',
    },
    {
      label: 'الوصفات',
      value: recipes.filter((r) => !r.isSubRecipe).length,
      icon: CookingPot,
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/20',
    },
    {
      label: 'متوسط التكلفة',
      value: formatCurrency(analytics.avgCost),
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/20',
      isText: true,
    },
    {
      label: 'متوسط الربح',
      value: formatCurrency(analytics.avgProfit),
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-green-500',
      glow: 'shadow-emerald-500/20',
      isText: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold" dir="rtl">
          <TypewriterText text="مرحباً بك 👋" delay={100} className="text-foreground" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          نظرة عامة على مشروعك
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 stagger-children">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.gradient} rounded-t-2xl`} />
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} ${stat.glow} shadow-lg mb-3`}>
                <Icon className="h-4.5 w-4.5 text-white" />
              </div>
              <p className={`font-bold font-mono tabular-nums ${stat.isText ? 'text-base' : 'text-2xl'}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Low Margin Alerts */}
      {analytics.lowMargin.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-500">
              تنبيه: وصفات بهامش ربح منخفض
            </span>
          </div>
          {analytics.lowMargin.map((item) => (
            <div
              key={item.recipe.id}
              className="flex items-center justify-between bg-background/50 rounded-xl px-3 py-2"
            >
              <span className="text-sm">{item.recipe.name}</span>
              <span className="text-xs font-mono text-amber-500">
                {formatPercentage(item.breakdown.profitMarginPercentage)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Top Profitable Recipes */}
      {analytics.topRecipes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">🏆 أعلى الوصفات ربحاً</h3>
            <button
              onClick={() => setActivePage('recipes')}
              className="text-xs text-amber-500 flex items-center gap-1"
            >
              عرض الكل
              <ArrowLeft className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2 stagger-children">
            {analytics.topRecipes.map((item, idx) => (
              <div key={item.recipe.id} className="item-card flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-sm font-bold text-amber-500 flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.recipe.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    التكلفة: {formatCurrency(item.breakdown.totalCost)}
                  </p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                    {formatCurrency(item.breakdown.netProfit)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">ربح</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {ingredients.length === 0 && recipes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CookingPot className="h-8 w-8 text-amber-500" />
          </div>
          <p className="font-bold">ابدأ بإضافة مكوناتك</p>
          <p className="text-sm text-muted-foreground max-w-[260px]">
            أضف المكونات أولاً ثم أنشئ وصفاتك لحساب التكلفة والأسعار تلقائياً
          </p>
          <button
            onClick={() => setActivePage('ingredients')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25"
          >
            إضافة أول مكون
          </button>
        </div>
      )}
    </div>
  );
}
