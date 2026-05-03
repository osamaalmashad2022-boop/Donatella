import { useState } from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import { IngredientCard } from './IngredientCard';
import { IngredientForm } from './IngredientForm';
import { Input } from '@/components/ui/input';
import { Search, Plus, Package } from 'lucide-react';
import { INGREDIENT_CATEGORIES } from '@/types';
import type { Ingredient, IngredientCategory } from '@/types';

export function IngredientPage() {
  const { ingredients, loading, addIngredient, updateIngredient, deleteIngredient } =
    useIngredients();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IngredientCategory | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const filtered = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(search.toLowerCase()) ||
      (ing.nameEn && ing.nameEn.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'all' || ing.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingIngredient(null);
  };

  // Get categories that have ingredients
  const usedCategories = [
    ...new Set(ingredients.map((i) => i.category)),
  ] as IngredientCategory[];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="ingredient-search"
          placeholder="بحث عن مكون..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pe-10 h-11 rounded-xl"
        />
      </div>

      {/* Category Filter Chips */}
      {usedCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`category-badge flex-shrink-0 cursor-pointer transition-all ${
              categoryFilter === 'all'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                : ''
            }`}
          >
            الكل ({ingredients.length})
          </button>
          {usedCategories.map((cat) => {
            const info = INGREDIENT_CATEGORIES[cat];
            const count = ingredients.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`category-badge flex-shrink-0 cursor-pointer transition-all ${
                  categoryFilter === cat
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                    : ''
                }`}
              >
                {info.icon} {info.ar} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Cards Grid */}
      {loading ? (
        <div className="empty-state">
          <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package className="h-8 w-8 text-amber-500" />
          </div>
          <p className="font-bold">
            {ingredients.length === 0
              ? 'لا توجد مكونات بعد'
              : 'لا توجد نتائج'}
          </p>
          <p className="text-sm text-muted-foreground">
            {ingredients.length === 0
              ? 'اضغط + لإضافة أول مكون'
              : 'جرب كلمة بحث مختلفة'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
          {filtered.map((ing) => (
            <IngredientCard
              key={ing.id}
              ingredient={ing}
              onEdit={handleEdit}
              onDelete={deleteIngredient}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        id="add-ingredient-btn"
        className="fab"
        onClick={() => setFormOpen(true)}
        aria-label="إضافة مكون"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Form */}
      <IngredientForm
        open={formOpen}
        onClose={handleClose}
        onSubmit={(data) => {
          if (editingIngredient) {
            updateIngredient(editingIngredient.id, data);
          } else {
            addIngredient(data);
          }
          handleClose();
        }}
        ingredient={editingIngredient}
      />
    </div>
  );
}
