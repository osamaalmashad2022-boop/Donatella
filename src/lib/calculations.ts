import type { WeightUnit, RecipeIngredient, Ingredient, CostBreakdown, MenuEngineeringCategory } from '@/types';

/**
 * Convert bulk weight to base unit (grams or milliliters).
 * KG → grams (×1000), Liter → ml (×1000), Gram/ML → as-is.
 */
export function convertToBaseUnit(weight: number, unit: WeightUnit): number {
  switch (unit) {
    case 'KG':
    case 'Liter':
      return weight * 1000;
    case 'Gram':
    case 'ML':
    default:
      return weight;
  }
}

/**
 * Calculate price per gram (or per ml).
 */
export function calcPricePerGram(bulkPrice: number, totalGrams: number): number {
  if (totalGrams <= 0) return 0;
  return bulkPrice / totalGrams;
}

/**
 * Raw ingredients cost (before waste).
 */
export function calcRawIngredientsCost(
  recipeIngredients: RecipeIngredient[],
  ingredientsMap: Map<string, Ingredient>
): number {
  return recipeIngredients.reduce((sum, ri) => {
    const ingredient = ingredientsMap.get(ri.ingredientId);
    if (!ingredient) return sum;
    return sum + ingredient.pricePerGram * ri.gramsUsed;
  }, 0);
}

/**
 * Waste cost only (extra material lost during prep).
 */
export function calcWasteCost(
  recipeIngredients: RecipeIngredient[],
  ingredientsMap: Map<string, Ingredient>
): number {
  return recipeIngredients.reduce((sum, ri) => {
    const ingredient = ingredientsMap.get(ri.ingredientId);
    if (!ingredient || !ri.wastePercentage) return sum;
    return sum + ingredient.pricePerGram * ri.gramsUsed * (ri.wastePercentage / 100);
  }, 0);
}

/**
 * Total ingredients cost = raw + waste.
 */
export function calcTotalIngredientsCost(
  recipeIngredients: RecipeIngredient[],
  ingredientsMap: Map<string, Ingredient>
): number {
  return (
    calcRawIngredientsCost(recipeIngredients, ingredientsMap) +
    calcWasteCost(recipeIngredients, ingredientsMap)
  );
}

/**
 * Cost per serving.
 */
export function calcCostPerServing(totalCost: number, servings: number): number {
  if (servings <= 0) return totalCost;
  return totalCost / servings;
}

/**
 * Food cost percentage = (cost / selling price) × 100.
 */
export function calcFoodCostPercentage(totalCost: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return (totalCost / sellingPrice) * 100;
}

/**
 * Scale recipe ingredients by a multiplier.
 */
export function scaleRecipeIngredients(
  ingredients: RecipeIngredient[],
  multiplier: number
): RecipeIngredient[] {
  return ingredients.map((ri) => ({
    ...ri,
    gramsUsed: Math.round(ri.gramsUsed * multiplier * 100) / 100,
  }));
}

/**
 * Menu Engineering classification.
 */
export function classifyMenuEngineering(
  profitMargin: number,
  avgProfitMargin: number
): MenuEngineeringCategory {
  if (avgProfitMargin <= 0) return 'puzzle';
  const ratio = profitMargin / avgProfitMargin;
  if (ratio >= 1.2) return 'star';
  if (ratio >= 0.9) return 'cow';
  if (ratio >= 0.5) return 'puzzle';
  return 'dog';
}

/**
 * Full cost breakdown for a recipe.
 */
export function calculateFullBreakdown(
  recipeIngredients: RecipeIngredient[],
  ingredientsMap: Map<string, Ingredient>,
  packagingCost: number,
  overheadPercentage: number,
  profitMarginPercentage: number,
  servings: number = 1,
  subRecipesCost: number = 0
): CostBreakdown {
  const rawIngredientsCost = calcRawIngredientsCost(recipeIngredients, ingredientsMap);
  const wasteCost = calcWasteCost(recipeIngredients, ingredientsMap);
  const totalIngredients = rawIngredientsCost + wasteCost;
  const baseCost = totalIngredients + subRecipesCost + packagingCost;
  const overheadAmount = baseCost * (overheadPercentage / 100);
  const totalCost = baseCost + overheadAmount;
  const suggestedSellingPrice = totalCost * (1 + profitMarginPercentage / 100);
  const netProfit = suggestedSellingPrice - totalCost;
  const costPerServing = calcCostPerServing(totalCost, servings);
  const foodCostPercentage = calcFoodCostPercentage(totalCost, suggestedSellingPrice);

  return {
    rawIngredientsCost,
    wasteCost,
    subRecipesCost,
    packagingCost,
    overheadAmount,
    totalCost,
    profitMarginPercentage,
    suggestedSellingPrice,
    netProfit,
    costPerServing,
    foodCostPercentage,
  };
}

/**
 * Format number as currency (EGP / ج.م)
 */
export function formatCurrency(value: number): string {
  return `${value.toFixed(2)} ج.م`;
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
