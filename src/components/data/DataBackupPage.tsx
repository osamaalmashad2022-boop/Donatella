import { useState, useRef } from 'react';
import { useIngredients } from '@/hooks/useIngredients';
import { useRecipes } from '@/hooks/useRecipes';
import { exportIngredientsToCSV, exportRecipesToCSV, exportToJSON } from '@/lib/export';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  HardDrive,
  Wheat,
  CookingPot,
  AlertTriangle,
} from 'lucide-react';

// SEC-2: Validation constants and helpers
const MAX_IMPORT_INGREDIENTS = 500;
const MAX_IMPORT_RECIPES = 200;

function validateIngredient(ing: unknown): boolean {
  if (!ing || typeof ing !== 'object') return false;
  const item = ing as Record<string, unknown>;
  return (
    typeof item.name === 'string' && item.name.length > 0 && item.name.length < 200 &&
    typeof item.bulkPrice === 'number' && item.bulkPrice >= 0 && item.bulkPrice < 1_000_000 &&
    typeof item.bulkWeight === 'number' && item.bulkWeight > 0 && item.bulkWeight < 1_000_000
  );
}

function validateRecipe(rec: unknown): boolean {
  if (!rec || typeof rec !== 'object') return false;
  const item = rec as Record<string, unknown>;
  return (
    typeof item.name === 'string' && item.name.length > 0 && item.name.length < 200 &&
    Array.isArray(item.ingredients)
  );
}

export function DataBackupPage() {
  const { ingredients, ingredientsMap } = useIngredients();
  const { recipes } = useRecipes();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      let ingCount = 0;
      let recCount = 0;
      let skippedCount = 0;

      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');

      // SEC-2: Import ingredients with validation
      if (data.ingredients && Array.isArray(data.ingredients)) {
        const validIngredients = data.ingredients.slice(0, MAX_IMPORT_INGREDIENTS);
        for (const ing of validIngredients) {
          if (!validateIngredient(ing)) {
            skippedCount++;
            continue;
          }
          await addDoc(collection(db, 'users', uid, 'ingredients'), {
            name: String(ing.name).trim(),
            nameEn: String(ing.nameEn || '').trim(),
            category: ing.category || 'other',
            bulkPrice: Number(ing.bulkPrice) || 0,
            bulkWeight: Number(ing.bulkWeight) || 0,
            weightUnit: ing.weightUnit || 'KG',
            totalGrams: Number(ing.totalGrams) || 0,
            pricePerGram: Number(ing.pricePerGram) || 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          ingCount++;
        }
      }

      // SEC-2: Import recipes with validation
      if (data.recipes && Array.isArray(data.recipes)) {
        const validRecipes = data.recipes.slice(0, MAX_IMPORT_RECIPES);
        for (const rec of validRecipes) {
          if (!validateRecipe(rec)) {
            skippedCount++;
            continue;
          }
          await addDoc(collection(db, 'users', uid, 'recipes'), {
            name: String(rec.name).trim(),
            nameEn: String(rec.nameEn || '').trim(),
            category: rec.category || 'regular',
            ingredients: Array.isArray(rec.ingredients) ? rec.ingredients : [],
            subRecipeIds: rec.subRecipeIds || [],
            isSubRecipe: rec.isSubRecipe || false,
            servings: Number(rec.servings) || 1,
            packagingCost: Number(rec.packagingCost) || 0,
            overheadPercentage: Number(rec.overheadPercentage) || 0,
            profitMarginPercentage: Number(rec.profitMarginPercentage) || 0,
            notes: String(rec.notes || '').trim(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          recCount++;
        }
      }

      let message = `تم الاستيراد بنجاح: ${ingCount} مكون و ${recCount} وصفة`;
      if (skippedCount > 0) {
        message += ` (تم تخطي ${skippedCount} عنصر غير صالح)`;
      }
      toast.success(message);
    } catch (err) {
      console.error('Import error:', err);
      toast.error('فشل الاستيراد. تأكد من صحة الملف.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // CC-1: Use shared exportToJSON instead of duplicating download logic
  const handleFullBackup = () => {
    const backupData = {
      ingredients,
      recipes,
      exportDate: new Date().toISOString(),
      version: '2.0',
    };
    exportToJSON(backupData, `donatella-backup-${new Date().toISOString().split('T')[0]}`);
    toast.success('تم تحميل النسخة الاحتياطية');
  };

  const stats = [
    {
      label: 'المكونات',
      value: ingredients.length,
      icon: Wheat,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'الوصفات',
      value: recipes.length,
      icon: CookingPot,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-lg">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.gradient} rounded-t-2xl`} />
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-2`}>
                <Icon className="h-4.5 w-4.5 text-white" />
              </div>
              <p className="text-2xl font-bold font-mono tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Full Backup */}
      <div className="item-card space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 flex-shrink-0">
            <HardDrive className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">نسخة احتياطية كاملة</h3>
            <p className="text-[11px] text-muted-foreground">
              تحميل جميع البيانات في ملف واحد
            </p>
          </div>
        </div>
        <Button
          id="export-full-backup"
          onClick={handleFullBackup}
          className="w-full rounded-xl bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          disabled={ingredients.length === 0 && recipes.length === 0}
        >
          <Download className="h-4 w-4 me-2" />
          تحميل النسخة الكاملة
        </Button>
      </div>

      {/* Import */}
      <div className="item-card space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg flex-shrink-0">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">استيراد بيانات</h3>
            <p className="text-[11px] text-muted-foreground">
              استعادة من نسخة احتياطية سابقة
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-400">
            تنبيه: سيتم إضافة البيانات المستوردة إلى البيانات الحالية (حد أقصى {MAX_IMPORT_INGREDIENTS} مكون و {MAX_IMPORT_RECIPES} وصفة)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-file-input"
        />
        <Button
          id="import-data-btn"
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          <Upload className="h-4 w-4 me-2" />
          {importing ? 'جاري الاستيراد...' : 'اختيار ملف JSON'}
        </Button>
      </div>

      {/* CSV Export */}
      <div className="item-card space-y-3">
        <h3 className="font-bold text-sm">تصدير Excel / CSV</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            id="export-ingredients-csv"
            variant="outline"
            className="rounded-xl text-xs"
            onClick={() => exportIngredientsToCSV(ingredients)}
            disabled={ingredients.length === 0}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 me-1 text-emerald-500" />
            المكونات CSV
          </Button>
          <Button
            id="export-recipes-csv"
            variant="outline"
            className="rounded-xl text-xs"
            onClick={() => exportRecipesToCSV(recipes, ingredientsMap)}
            disabled={recipes.length === 0}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 me-1 text-emerald-500" />
            الوصفات CSV
          </Button>
        </div>
      </div>

      {/* JSON Export */}
      <div className="item-card space-y-3">
        <h3 className="font-bold text-sm">تصدير JSON</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            id="export-ingredients-json"
            variant="outline"
            className="rounded-xl text-xs"
            onClick={() => exportToJSON(ingredients, 'donatella-ingredients')}
            disabled={ingredients.length === 0}
          >
            <FileJson className="h-3.5 w-3.5 me-1 text-amber-500" />
            المكونات JSON
          </Button>
          <Button
            id="export-recipes-json"
            variant="outline"
            className="rounded-xl text-xs"
            onClick={() => exportToJSON(recipes, 'donatella-recipes')}
            disabled={recipes.length === 0}
          >
            <FileJson className="h-3.5 w-3.5 me-1 text-amber-500" />
            الوصفات JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
