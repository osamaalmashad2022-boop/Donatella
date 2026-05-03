import type { Ingredient, Recipe } from '@/types';

/**
 * Export data as JSON file with pretty formatting.
 */
export function exportToJSON(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Export data as CSV with UTF-8 BOM for proper Arabic rendering in Excel.
 */
export function exportIngredientsToCSV(ingredients: Ingredient[]): void {
  const headers = [
    'الاسم / Name',
    'سعر الجملة / Bulk Price',
    'الوزن / Weight',
    'الوحدة / Unit',
    'الوزن الكلي (جرام) / Total Grams',
    'سعر الجرام / Price Per Gram',
  ];

  const rows = ingredients.map((ing) => [
    ing.name,
    ing.bulkPrice.toString(),
    ing.bulkWeight.toString(),
    ing.weightUnit,
    ing.totalGrams.toString(),
    ing.pricePerGram.toFixed(4),
  ]);

  generateCSV(headers, rows, 'ingredients');
}

/**
 * Export recipes as CSV with UTF-8 BOM.
 */
export function exportRecipesToCSV(recipes: Recipe[], ingredientsMap: Map<string, Ingredient>): void {
  const headers = [
    'اسم الوصفة / Recipe Name',
    'التصنيف / Category',
    'تكلفة التغليف / Packaging Cost',
    'نسبة النفقات العامة / Overhead %',
    'نسبة هامش الربح / Profit Margin %',
    'المكونات / Ingredients',
  ];

  const rows = recipes.map((recipe) => {
    const ingredientsList = recipe.ingredients
      .map((ri) => {
        const ing = ingredientsMap.get(ri.ingredientId);
        return ing ? `${ing.name} (${ri.gramsUsed}g)` : `Unknown (${ri.gramsUsed}g)`;
      })
      .join(' | ');

    return [
      recipe.name,
      recipe.category === 'healthy' ? 'صحي / Healthy' : 'عادي / Regular',
      recipe.packagingCost.toString(),
      recipe.overheadPercentage.toString(),
      recipe.profitMarginPercentage.toString(),
      ingredientsList,
    ];
  });

  generateCSV(headers, rows, 'recipes');
}

function generateCSV(headers: string[], rows: string[][], filename: string): void {
  const BOM = '\uFEFF';
  const csvContent =
    BOM +
    [headers.join(','), ...rows.map((row) => row.map(escapeCSV).join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${filename}.csv`);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
