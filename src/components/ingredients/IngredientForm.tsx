import { useState, useEffect, useMemo } from 'react';
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
import { convertToBaseUnit, calcPricePerGram, formatCurrency } from '@/lib/calculations';
import { INGREDIENT_CATEGORIES } from '@/types';
import type { Ingredient, WeightUnit, IngredientCategory } from '@/types';

interface IngredientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    nameEn?: string;
    category: IngredientCategory;
    bulkPrice: number;
    bulkWeight: number;
    weightUnit: WeightUnit;
  }) => void;
  ingredient: Ingredient | null;
}

export function IngredientForm({ open, onClose, onSubmit, ingredient }: IngredientFormProps) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('other');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkWeight, setBulkWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('KG');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setNameEn(ingredient.nameEn || '');
      setCategory(ingredient.category || 'other');
      setBulkPrice(ingredient.bulkPrice.toString());
      setBulkWeight(ingredient.bulkWeight.toString());
      setWeightUnit(ingredient.weightUnit);
    } else {
      setName('');
      setNameEn('');
      setCategory('other');
      setBulkPrice('');
      setBulkWeight('');
      setWeightUnit('KG');
    }
  }, [ingredient, open]);

  const preview = useMemo(() => {
    const price = parseFloat(bulkPrice) || 0;
    const weight = parseFloat(bulkWeight) || 0;
    if (price <= 0 || weight <= 0) return null;
    const totalGrams = convertToBaseUnit(weight, weightUnit);
    const pricePerGram = calcPricePerGram(price, totalGrams);
    return { totalGrams, pricePerGram };
  }, [bulkPrice, bulkWeight, weightUnit]);

  const isValid = name.trim() && parseFloat(bulkPrice) > 0 && parseFloat(bulkWeight) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      onSubmit({
        name: name.trim(),
        nameEn: nameEn.trim() || undefined,
        category,
        bulkPrice: parseFloat(bulkPrice),
        bulkWeight: parseFloat(bulkWeight),
        weightUnit,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? 'تعديل المكون' : 'إضافة مكون جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="ing-name">اسم المكون *</Label>
            <Input
              id="ing-name"
              placeholder="مثال: دقيق لوز"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          {/* English name */}
          <div className="space-y-2">
            <Label htmlFor="ing-name-en">الاسم بالإنجليزية (اختياري)</Label>
            <Input
              id="ing-name-en"
              placeholder="e.g. Almond Flour"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              dir="ltr"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="ing-category">الفئة</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as IngredientCategory)}>
              <SelectTrigger id="ing-category" className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INGREDIENT_CATEGORIES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.icon} {val.ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ing-price">سعر الجملة (ج.م) *</Label>
              <Input
                id="ing-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                dir="ltr"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ing-weight">الوزن *</Label>
              <Input
                id="ing-weight"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={bulkWeight}
                onChange={(e) => setBulkWeight(e.target.value)}
                dir="ltr"
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="ing-unit">الوحدة</Label>
            <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as WeightUnit)}>
              <SelectTrigger id="ing-unit" className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KG">كيلوجرام</SelectItem>
                <SelectItem value="Gram">جرام</SelectItem>
                <SelectItem value="Liter">لتر</SelectItem>
                <SelectItem value="ML">مل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Live Preview */}
          {preview && (
            <div className="cost-result space-y-1">
              <p className="text-[11px] text-muted-foreground">حساب تلقائي</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  الوزن الكلي:{' '}
                  <span className="font-mono">{preview.totalGrams.toLocaleString()}</span>{' '}
                  {weightUnit === 'Liter' || weightUnit === 'ML' ? 'مل' : 'جم'}
                </span>
                <span className="font-mono font-bold text-amber-500">
                  {formatCurrency(preview.pricePerGram)}/جم
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              {submitting ? 'جاري الحفظ...' : ingredient ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
