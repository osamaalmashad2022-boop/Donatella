// ——— Weight Units ———
export type WeightUnit = 'KG' | 'Gram' | 'Liter' | 'ML';

// ——— Ingredient Categories ———
export type IngredientCategory =
  | 'flour' | 'sugar' | 'dairy' | 'fat' | 'eggs'
  | 'flavor' | 'color' | 'nuts' | 'fruit' | 'chocolate'
  | 'packaging' | 'other';

export const INGREDIENT_CATEGORIES: Record<IngredientCategory, { ar: string; icon: string }> = {
  flour:     { ar: 'طحين ونشويات', icon: '🌾' },
  sugar:     { ar: 'سكريات',       icon: '🍬' },
  dairy:     { ar: 'ألبان',        icon: '🥛' },
  fat:       { ar: 'دهون وزيوت',   icon: '🧈' },
  eggs:      { ar: 'بيض',          icon: '🥚' },
  flavor:    { ar: 'منكهات',       icon: '🌿' },
  color:     { ar: 'ألوان',        icon: '🎨' },
  nuts:      { ar: 'مكسرات',       icon: '🥜' },
  fruit:     { ar: 'فواكه',        icon: '🍓' },
  chocolate: { ar: 'شوكولاتة',     icon: '🍫' },
  packaging: { ar: 'تغليف',        icon: '📦' },
  other:     { ar: 'أخرى',         icon: '📋' },
};

// ——— Ingredient ———
export interface Ingredient {
  id: string;
  name: string;
  nameEn?: string;
  category: IngredientCategory;
  bulkPrice: number;
  bulkWeight: number;
  weightUnit: WeightUnit;
  totalGrams: number;
  pricePerGram: number;
  createdAt: string;
  updatedAt: string;
}

// ——— Recipe Ingredient (line item) ———
export interface RecipeIngredient {
  ingredientId: string;
  gramsUsed: number;
  wastePercentage: number; // 0–100, default 0
}

// ——— Recipe ———
export type RecipeCategory = 'healthy' | 'regular';

export interface Recipe {
  id: string;
  name: string;
  nameEn?: string;
  category: RecipeCategory;
  ingredients: RecipeIngredient[];
  subRecipeIds: string[];
  isSubRecipe: boolean;
  servings: number;
  packagingCost: number;
  overheadPercentage: number;
  profitMarginPercentage: number;
  notes: string;
  noteImages?: string[];
  createdAt: string;
  updatedAt: string;
}

// ——— Cost Breakdown ———
export interface CostBreakdown {
  rawIngredientsCost: number;
  wasteCost: number;
  subRecipesCost: number;
  packagingCost: number;
  overheadAmount: number;
  totalCost: number;
  profitMarginPercentage: number;
  suggestedSellingPrice: number;
  netProfit: number;
  costPerServing: number;
  foodCostPercentage: number;
}

// ——— Menu Engineering ———
export type MenuEngineeringCategory = 'star' | 'cow' | 'puzzle' | 'dog';

export const MENU_ENGINEERING_LABELS: Record<MenuEngineeringCategory, { ar: string; icon: string; color: string }> = {
  star:   { ar: 'نجمة — ربح عالي',       icon: '⭐', color: '#f59e0b' },
  cow:    { ar: 'بقرة نقدية — ربح ثابت', icon: '🐄', color: '#22c55e' },
  puzzle: { ar: 'لغز — يحتاج تحسين',     icon: '🧩', color: '#3b82f6' },
  dog:    { ar: 'ضعيف — مراجعة مطلوبة',   icon: '🐕', color: '#ef4444' },
};

// ——— Navigation ———
export type AppPage = 'dashboard' | 'ingredients' | 'recipes' | 'analytics' | 'data';
