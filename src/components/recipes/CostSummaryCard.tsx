import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { calculateFullBreakdown, formatCurrency, formatPercentage } from '@/lib/calculations';
import type { Ingredient, RecipeIngredient } from '@/types';
import { TrendingUp, DollarSign, Receipt, Package, Percent, Scissors, PieChart, Users } from 'lucide-react';

interface CostSummaryCardProps {
  recipeIngredients: RecipeIngredient[];
  ingredientsMap: Map<string, Ingredient>;
  packagingCost: number;
  overheadPercentage: number;
  profitMarginPercentage: number;
  servings: number;
}

export function CostSummaryCard({
  recipeIngredients,
  ingredientsMap,
  packagingCost,
  overheadPercentage,
  profitMarginPercentage,
  servings,
}: CostSummaryCardProps) {
  const breakdown = useMemo(
    () =>
      calculateFullBreakdown(
        recipeIngredients,
        ingredientsMap,
        packagingCost,
        overheadPercentage,
        profitMarginPercentage,
        servings
      ),
    [recipeIngredients, ingredientsMap, packagingCost, overheadPercentage, profitMarginPercentage, servings]
  );

  const items = [
    {
      label: 'تكلفة المكونات',
      value: breakdown.rawIngredientsCost,
      icon: Receipt,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'تكلفة الهدر',
      value: breakdown.wasteCost,
      icon: Scissors,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      hide: breakdown.wasteCost === 0,
    },
    {
      label: 'تكلفة التغليف',
      value: breakdown.packagingCost,
      icon: Package,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'النفقات العامة',
      value: breakdown.overheadAmount,
      icon: Percent,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
  ].filter((item) => !item.hide);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-card overflow-hidden">
      {/* Decorative top bar */}
      <div className="h-1 bg-gradient-to-l from-amber-500 via-orange-500 to-amber-600" />

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="font-bold text-sm">ملخص التكلفة</h3>
        </div>

        {/* Cost breakdown */}
        <div className="space-y-2.5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md ${item.bg}`}>
                    <Icon className={`h-3 w-3 ${item.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-mono text-sm tabular-nums">
                  {formatCurrency(item.value)}
                </span>
              </div>
            );
          })}
        </div>

        <Separator className="opacity-30" />

        {/* Total Cost */}
        <div className="cost-result space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-500">التكلفة النهائية</span>
            <span className="text-lg font-bold font-mono text-amber-500 tabular-nums">
              {formatCurrency(breakdown.totalCost)}
            </span>
          </div>
        </div>

        {/* Selling Price */}
        <div className="cost-result cost-result-success space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-500">سعر البيع المقترح</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {formatCurrency(breakdown.suggestedSellingPrice)}
            </span>
          </div>
        </div>

        {/* Extra info */}
        <div className="space-y-2">
          {/* Net Profit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs">صافي الربح</span>
            </div>
            <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
              {formatCurrency(breakdown.netProfit)}
            </span>
          </div>

          {/* Cost per serving */}
          {servings > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs">تكلفة القطعة الواحدة</span>
              </div>
              <span className="font-mono text-sm font-medium tabular-nums">
                {formatCurrency(breakdown.costPerServing)}
              </span>
            </div>
          )}

          {/* Food cost % */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs">نسبة تكلفة الطعام</span>
            </div>
            <span
              className={`font-mono text-sm font-medium tabular-nums ${
                breakdown.foodCostPercentage > 35
                  ? 'text-red-400'
                  : breakdown.foodCostPercentage > 28
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              }`}
            >
              {formatPercentage(breakdown.foodCostPercentage)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
