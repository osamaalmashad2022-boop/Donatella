import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { INGREDIENT_CATEGORIES } from '@/types';
import type { Ingredient } from '@/types';

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => void;
}

export function IngredientCard({ ingredient, onEdit, onDelete }: IngredientCardProps) {
  const cat = INGREDIENT_CATEGORIES[ingredient.category] || INGREDIENT_CATEGORIES.other;
  const unitLabel =
    ingredient.weightUnit === 'KG' ? 'كجم' :
    ingredient.weightUnit === 'Gram' ? 'جم' :
    ingredient.weightUnit === 'Liter' ? 'لتر' : 'مل';

  return (
    <div className="item-card space-y-3">
      {/* Top row: name + category */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-sm truncate">{ingredient.name}</h3>
          {ingredient.nameEn && (
            <p className="text-[11px] text-muted-foreground truncate" dir="ltr">
              {ingredient.nameEn}
            </p>
          )}
        </div>
        <span className="category-badge flex-shrink-0">
          {cat.icon} {cat.ar}
        </span>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div>
          <span className="block text-[10px] opacity-70">سعر الجملة</span>
          <span className="font-mono font-medium text-foreground">
            {formatCurrency(ingredient.bulkPrice)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] opacity-70">الوزن</span>
          <span className="font-mono font-medium text-foreground">
            {ingredient.bulkWeight} {unitLabel}
          </span>
        </div>
      </div>

      {/* Price per gram + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <div className="cost-result px-3 py-1.5 rounded-lg">
          <span className="text-[10px] text-muted-foreground">سعر الجرام: </span>
          <span className="font-mono font-bold text-sm text-amber-500">
            {ingredient.pricePerGram.toFixed(4)} ج.م
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => onEdit(ingredient)}
            aria-label="تعديل"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
            onClick={() => {
              if (window.confirm(`هل تريد حذف "${ingredient.name}" نهائياً؟`)) {
                onDelete(ingredient.id);
              }
            }}
            aria-label="حذف"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
}
