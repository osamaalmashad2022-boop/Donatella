import { useMemo } from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import { useRecipes } from '@/hooks/useRecipes';
import {
  calculateFullBreakdown,
  formatCurrency,
  formatPercentage,
  classifyMenuEngineering,
} from '@/lib/calculations';
import { MENU_ENGINEERING_LABELS } from '@/types';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export function AnalyticsPage() {
  const { ingredientsMap } = useIngredients();
  const { recipes } = useRecipes();

  const analytics = useMemo(() => {
    const mainRecipes = recipes.filter((r) => !r.isSubRecipe);

    const breakdowns = mainRecipes.map((r) => ({
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

    const avgProfit =
      breakdowns.length > 0
        ? breakdowns.reduce((s, b) => s + b.breakdown.netProfit, 0) / breakdowns.length
        : 0;

    // Classify each recipe
    const classified = breakdowns.map((b) => ({
      ...b,
      engineeringCategory: classifyMenuEngineering(b.breakdown.netProfit, avgProfit),
    }));

    // Sort by profit
    const byProfit = [...classified].sort(
      (a, b) => b.breakdown.netProfit - a.breakdown.netProfit
    );

    // Group by engineering category
    const groups = {
      star: classified.filter((c) => c.engineeringCategory === 'star'),
      cow: classified.filter((c) => c.engineeringCategory === 'cow'),
      puzzle: classified.filter((c) => c.engineeringCategory === 'puzzle'),
      dog: classified.filter((c) => c.engineeringCategory === 'dog'),
    };

    return { breakdowns, classified, byProfit, groups, avgProfit };
  }, [recipes, ingredientsMap]);

  if (analytics.breakdowns.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state-icon">
          <BarChart3 className="h-8 w-8 text-amber-500" />
        </div>
        <p className="font-bold">لا توجد بيانات للتحليل</p>
        <p className="text-sm text-muted-foreground">
          أضف وصفات أولاً لرؤية تحليل الربحية
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-green-500 rounded-t-2xl" />
          <TrendingUp className="h-5 w-5 text-emerald-500 mb-2" />
          <p className="font-bold font-mono tabular-nums text-lg">
            {formatCurrency(analytics.avgProfit)}
          </p>
          <p className="text-xs text-muted-foreground">متوسط الربح</p>
        </div>
        <div className="stat-card">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl" />
          <BarChart3 className="h-5 w-5 text-amber-500 mb-2" />
          <p className="font-bold font-mono tabular-nums text-lg">
            {analytics.breakdowns.length}
          </p>
          <p className="text-xs text-muted-foreground">إجمالي الوصفات</p>
        </div>
      </div>

      {/* Menu Engineering */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm">📊 تصنيف هندسة القائمة</h3>
        <p className="text-xs text-muted-foreground">
          تصنيف الوصفات بناءً على ربحيتها مقارنة بالمتوسط
        </p>

        {(['star', 'cow', 'puzzle', 'dog'] as const).map((cat) => {
          const info = MENU_ENGINEERING_LABELS[cat];
          const items = analytics.groups[cat];
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{info.icon}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: info.color }}
                >
                  {info.ar}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({items.length})
                </span>
              </div>

              {items.map((item) => (
                <div
                  key={item.recipe.id}
                  className="item-card flex items-center justify-between !py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.recipe.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      التكلفة: {formatCurrency(item.breakdown.totalCost)} |
                      البيع: {formatCurrency(item.breakdown.suggestedSellingPrice)}
                    </p>
                  </div>
                  <div className="text-left flex-shrink-0 ms-3">
                    <p
                      className="font-mono font-bold text-sm tabular-nums"
                      style={{ color: info.color }}
                    >
                      {formatCurrency(item.breakdown.netProfit)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatPercentage(item.breakdown.foodCostPercentage)} تكلفة طعام
                    </p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Rankings */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm">🏅 ترتيب الوصفات حسب الربح</h3>

        {analytics.byProfit.map((item, idx) => {
          const isTop = idx < 3;
          const isBottom = idx >= analytics.byProfit.length - 1 && analytics.byProfit.length > 3;
          return (
            <div
              key={item.recipe.id}
              className="item-card flex items-center gap-3 !py-3"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold flex-shrink-0 ${
                  isTop
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-500'
                    : isBottom
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.recipe.name}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.breakdown.netProfit >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                )}
                <span
                  className={`font-mono font-bold text-sm tabular-nums ${
                    item.breakdown.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(item.breakdown.netProfit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
