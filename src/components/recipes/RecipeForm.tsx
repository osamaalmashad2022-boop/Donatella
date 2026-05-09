import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IngredientRow } from './IngredientRow';
import { CostSummaryCard } from './CostSummaryCard';
import { Plus } from 'lucide-react';
import type { Ingredient, Recipe, RecipeCategory, RecipeIngredient } from '@/types';

interface RecipeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    nameEn?: string;
    category: RecipeCategory;
    ingredients: RecipeIngredient[];
    servings: number;
    packagingCost: number;
    overheadPercentage: number;
    profitMarginPercentage: number;
    notes: string;
  }) => Promise<void>;
  recipe: Recipe | null;
  ingredients: Ingredient[];
  ingredientsMap: Map<string, Ingredient>;
}

export function RecipeForm({
  open,
  onClose,
  onSubmit,
  recipe,
  ingredients,
  ingredientsMap,
}: RecipeFormProps) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('regular');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [servings, setServings] = useState('1');
  const [packagingCost, setPackagingCost] = useState('0');
  const [overheadPercentage, setOverheadPercentage] = useState('10');
  const [profitMarginPercentage, setProfitMarginPercentage] = useState('30');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setNameEn(recipe.nameEn || '');
      setCategory(recipe.category);
      setRecipeIngredients([...recipe.ingredients]);
      setServings((recipe.servings || 1).toString());
      setPackagingCost(recipe.packagingCost.toString());
      setOverheadPercentage(recipe.overheadPercentage.toString());
      setProfitMarginPercentage(recipe.profitMarginPercentage.toString());
      setNotes(recipe.notes || '');
    } else {
      setName('');
      setNameEn('');
      setCategory('regular');
      setRecipeIngredients([]);
      setServings('1');
      setPackagingCost('0');
      setOverheadPercentage('10');
      setProfitMarginPercentage('30');
      setNotes('');
    }
  }, [recipe, open]);

  const addIngredientRow = () => {
    setRecipeIngredients([
      ...recipeIngredients,
      { ingredientId: '', gramsUsed: 0, wastePercentage: 0 },
    ]);
  };

  const updateIngredientRow = (
    index: number,
    ingredientId: string,
    gramsUsed: number,
    wastePercentage: number
  ) => {
    const updated = [...recipeIngredients];
    updated[index] = { ingredientId, gramsUsed, wastePercentage };
    setRecipeIngredients(updated);
  };

  const removeIngredientRow = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const validIngredients = recipeIngredients.filter(
    (ri) => ri.ingredientId && ri.gramsUsed > 0
  );

  const isValid = name.trim() && validIngredients.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        nameEn: nameEn.trim() || undefined,
        category,
        ingredients: validIngredients,
        servings: parseInt(servings) || 1,
        packagingCost: parseFloat(packagingCost) || 0,
        overheadPercentage: parseFloat(overheadPercentage) || 0,
        profitMarginPercentage: parseFloat(profitMarginPercentage) || 0,
        notes: notes.trim(),
      });
    } catch (err) {
      console.error('Failed to save recipe:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recipe ? 'تعديل الوصفة' : 'وصفة جديدة'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="recipe-name">اسم الوصفة *</Label>
              <Input
                id="recipe-name"
                placeholder="مثال: كيك شوكولاتة"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipe-name-en">بالإنجليزية (اختياري)</Label>
              <Input
                id="recipe-name-en"
                placeholder="e.g. Chocolate Cake"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                dir="ltr"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Category + Servings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="recipe-category">التصنيف</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as RecipeCategory)}>
                <SelectTrigger id="recipe-category" className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">عادي</SelectItem>
                  <SelectItem value="healthy">صحي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipe-servings">عدد القطع / الحصص</Label>
              <Input
                id="recipe-servings"
                type="number"
                min="1"
                placeholder="1"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                dir="ltr"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">المكونات</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredientRow}
                className="text-xs rounded-xl"
                id="add-recipe-ingredient-btn"
              >
                <Plus className="h-3 w-3 me-1" />
                إضافة مكون
              </Button>
            </div>

            {recipeIngredients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-xl">
                <p>لم يتم إضافة مكونات بعد</p>
                <p className="text-xs mt-1">اضغط "إضافة مكون" للبدء</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recipeIngredients.map((ri, index) => (
                  <IngredientRow
                    key={index}
                    index={index}
                    ingredientId={ri.ingredientId}
                    gramsUsed={ri.gramsUsed}
                    wastePercentage={ri.wastePercentage}
                    ingredients={ingredients}
                    ingredientsMap={ingredientsMap}
                    onChange={(id, grams, waste) =>
                      updateIngredientRow(index, id, grams, waste)
                    }
                    onRemove={() => removeIngredientRow(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cost Parameters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="recipe-packaging">التغليف (ج.م)</Label>
              <Input
                id="recipe-packaging"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={packagingCost}
                onChange={(e) => setPackagingCost(e.target.value)}
                dir="ltr"
                className="h-10 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipe-overhead">النفقات %</Label>
              <Input
                id="recipe-overhead"
                type="number"
                step="0.1"
                min="0"
                placeholder="10"
                value={overheadPercentage}
                onChange={(e) => setOverheadPercentage(e.target.value)}
                dir="ltr"
                className="h-10 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipe-profit">الربح %</Label>
              <Input
                id="recipe-profit"
                type="number"
                step="0.1"
                min="0"
                placeholder="30"
                value={profitMarginPercentage}
                onChange={(e) => setProfitMarginPercentage(e.target.value)}
                dir="ltr"
                className="h-10 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="recipe-notes">ملاحظات (اختياري)</Label>
            <Input
              id="recipe-notes"
              placeholder="ملاحظات إضافية..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Live Cost Summary */}
          <CostSummaryCard
            recipeIngredients={recipeIngredients}
            ingredientsMap={ingredientsMap}
            packagingCost={parseFloat(packagingCost) || 0}
            overheadPercentage={parseFloat(overheadPercentage) || 0}
            profitMarginPercentage={parseFloat(profitMarginPercentage) || 0}
            servings={parseInt(servings) || 1}
          />

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              {submitting ? 'جاري الحفظ...' : recipe ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
