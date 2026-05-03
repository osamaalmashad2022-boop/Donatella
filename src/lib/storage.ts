import type { Ingredient, Recipe } from '@/types';

const INGREDIENTS_KEY = 'donatella_ingredients';
const RECIPES_KEY = 'donatella_recipes';

/** Generate a unique ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

// ——— Ingredients ———

export function loadIngredients(): Ingredient[] {
  try {
    const data = localStorage.getItem(INGREDIENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveIngredients(ingredients: Ingredient[]): void {
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(ingredients));
}

// ——— Recipes ———

export function loadRecipes(): Recipe[] {
  try {
    const data = localStorage.getItem(RECIPES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

// ——— Full Export / Import ———

export function exportAllData(): string {
  return JSON.stringify(
    {
      ingredients: loadIngredients(),
      recipes: loadRecipes(),
      exportDate: new Date().toISOString(),
      version: '2.0',
    },
    null,
    2
  );
}

export function importAllData(jsonStr: string): {
  ingredients: Ingredient[];
  recipes: Recipe[];
} {
  const data = JSON.parse(jsonStr);
  const ingredients: Ingredient[] = data.ingredients || [];
  const recipes: Recipe[] = data.recipes || [];
  saveIngredients(ingredients);
  saveRecipes(recipes);
  return { ingredients, recipes };
}
