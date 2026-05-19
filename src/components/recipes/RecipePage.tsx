import { useState, useMemo } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { RecipeForm } from './RecipeForm';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  CookingPot,
  Pencil,
  Trash2,
  Copy,
  TrendingUp,
} from 'lucide-react';
import {
  calculateFullBreakdown,
  formatCurrency,
  scaleRecipeIngredients,
} from '@/lib/calculations';
import { toast } from 'sonner';
import type { Recipe } from '@/types';



export function RecipePage() {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { ingredients, ingredientsMap } = useIngredients();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const mainRecipes = useMemo(
    () => recipes.filter((r) => !r.isSubRecipe),
    [recipes]
  );

  const filtered = useMemo(
    () =>
      mainRecipes.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.nameEn && r.nameEn.toLowerCase().includes(search.toLowerCase()))
      ),
    [mainRecipes, search]
  );

  // PERF-1: Memoize breakdown calculations
  const recipesWithBreakdown = useMemo(
    () =>
      filtered.map((recipe) => ({
        recipe,
        breakdown: calculateFullBreakdown(
          recipe.ingredients,
          ingredientsMap,
          recipe.packagingCost,
          recipe.overheadPercentage,
          recipe.profitMarginPercentage,
          recipe.servings
        ),
      })),
    [filtered, ingredientsMap]
  );

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingRecipe(null);
  };

  // BUG-3: Added async/await + error handling + toast feedback
  const handleDuplicate = async (recipe: Recipe, multiplier: number = 1) => {
    try {
      const scaled = scaleRecipeIngredients(recipe.ingredients, multiplier);
      await addRecipe({
        name: multiplier > 1 ? `${recipe.name} (×${multiplier})` : `${recipe.name} — نسخة`,
        nameEn: recipe.nameEn,
        category: recipe.category,
        ingredients: scaled,
        servings: Math.round((recipe.servings || 1) * multiplier),
        packagingCost: recipe.packagingCost * multiplier,
        overheadPercentage: recipe.overheadPercentage,
        profitMarginPercentage: recipe.profitMarginPercentage,
        notes: recipe.notes,
      });
      toast.success('تم نسخ الوصفة بنجاح');
    } catch (err) {
      console.error('Failed to duplicate recipe:', err);
      toast.error('فشل نسخ الوصفة');
    }
  };

  // SEC-3: Confirm before delete
  const handleDelete = async (recipe: Recipe) => {
    if (window.confirm(`هل تريد حذف "${recipe.name}" نهائياً؟`)) {
      try {
        await deleteRecipe(recipe.id);
        toast.success('تم حذف الوصفة');
      } catch (err) {
        console.error('Failed to delete recipe:', err);
        toast.error('فشل حذف الوصفة');
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="recipe-search"
          placeholder="بحث عن وصفة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pe-10 h-11 rounded-xl"
        />
      </div>

      {/* Recipe Cards */}
      {loading ? (
        <div className="empty-state">
          <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CookingPot className="h-8 w-8 text-amber-500" />
          </div>
          <p className="font-bold">
            {mainRecipes.length === 0 ? 'لا توجد وصفات بعد' : 'لا توجد نتائج'}
          </p>
          <p className="text-sm text-muted-foreground">
            {mainRecipes.length === 0
              ? 'اضغط + لإنشاء أول وصفة'
              : 'جرب كلمة بحث مختلفة'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
          {recipesWithBreakdown.map(({ recipe, breakdown }) => (
            <div key={recipe.id} className="item-card space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{recipe.name}</h3>
                  {recipe.nameEn && (
                    <p className="text-[11px] text-muted-foreground truncate" dir="ltr">
                      {recipe.nameEn}
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={
                    recipe.category === 'healthy'
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px]'
                      : 'bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px]'
                  }
                >
                  {recipe.category === 'healthy' ? '🥗 صحي' : '🍰 عادي'}
                </Badge>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/30 py-2 px-1">
                  <p className="text-[10px] text-muted-foreground">المكونات</p>
                  <p className="font-mono font-bold text-sm">{recipe.ingredients.length}</p>
                </div>
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 py-2 px-1">
                  <p className="text-[10px] text-muted-foreground">التكلفة</p>
                  <p className="font-mono font-bold text-sm text-amber-500">
                    {formatCurrency(breakdown.totalCost)}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 py-2 px-1">
                  <p className="text-[10px] text-muted-foreground">سعر البيع</p>
                  <p className="font-mono font-bold text-sm text-emerald-400">
                    {formatCurrency(breakdown.suggestedSellingPrice)}
                  </p>
                </div>
              </div>

              {/* Profit row */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">الربح</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {formatCurrency(breakdown.netProfit)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/20">


                {/* Edit/Delete/Duplicate */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => handleDuplicate(recipe)}
                    aria-label="نسخ"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => handleEdit(recipe)}
                    aria-label="تعديل"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    onClick={() => handleDelete(recipe)}
                    aria-label="حذف"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        id="add-recipe-btn"
        className="fab"
        onClick={() => setFormOpen(true)}
        aria-label="إضافة وصفة"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Form */}
      <RecipeForm
        open={formOpen}
        onClose={handleClose}
        onSubmit={async (data) => {
          if (editingRecipe) {
            await updateRecipe(editingRecipe.id, data);
          } else {
            await addRecipe(data);
          }
          handleClose();
        }}
        recipe={editingRecipe}
        ingredients={ingredients}
        ingredientsMap={ingredientsMap}
      />
    </div>
  );
}
