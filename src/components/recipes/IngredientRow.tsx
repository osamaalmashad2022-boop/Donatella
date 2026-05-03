import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import type { Ingredient } from '@/types';

interface IngredientRowProps {
  ingredientId: string;
  gramsUsed: number;
  wastePercentage: number;
  ingredients: Ingredient[];
  ingredientsMap: Map<string, Ingredient>;
  onChange: (ingredientId: string, gramsUsed: number, wastePercentage: number) => void;
  onRemove: () => void;
  index: number;
}

export function IngredientRow({
  ingredientId,
  gramsUsed,
  wastePercentage,
  ingredients,
  ingredientsMap,
  onChange,
  onRemove,
  index,
}: IngredientRowProps) {
  const selectedIngredient = ingredientsMap.get(ingredientId);
  const effectiveGrams = gramsUsed * (1 + wastePercentage / 100);
  const lineCost = selectedIngredient ? selectedIngredient.pricePerGram * effectiveGrams : 0;

  return (
    <div className="item-card space-y-3 !p-3">
      {/* Row header: number + delete */}
      <div className="flex items-center justify-between">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
          {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Ingredient select */}
      <Select value={ingredientId} onValueChange={(v) => onChange(v, gramsUsed, wastePercentage)}>
        <SelectTrigger id={`recipe-ing-select-${index}`} className="h-10 rounded-xl text-xs">
          <SelectValue placeholder="اختر مكون..." />
        </SelectTrigger>
        <SelectContent>
          {ingredients.map((ing) => (
            <SelectItem key={ing.id} value={ing.id}>
              {ing.name}
              {ing.nameEn ? ` — ${ing.nameEn}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Grams + Waste row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">الكمية (جم)</label>
          <Input
            id={`recipe-ing-grams-${index}`}
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            value={gramsUsed || ''}
            onChange={(e) =>
              onChange(ingredientId, parseFloat(e.target.value) || 0, wastePercentage)
            }
            dir="ltr"
            className="h-9 rounded-lg text-center text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">الهدر %</label>
          <Input
            id={`recipe-ing-waste-${index}`}
            type="number"
            step="1"
            min="0"
            max="100"
            placeholder="0"
            value={wastePercentage || ''}
            onChange={(e) =>
              onChange(ingredientId, gramsUsed, parseFloat(e.target.value) || 0)
            }
            dir="ltr"
            className="h-9 rounded-lg text-center text-sm"
          />
        </div>
      </div>

      {/* Line cost */}
      {lineCost > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/20">
          <span className="text-[10px] text-muted-foreground">التكلفة</span>
          <span className="font-mono text-sm font-bold text-amber-500 tabular-nums">
            {formatCurrency(lineCost)}
          </span>
        </div>
      )}
    </div>
  );
}
