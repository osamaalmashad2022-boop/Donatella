import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Recipe, RecipeCategory, RecipeIngredient } from '@/types';

function getUserCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return collection(db, 'users', uid, 'recipes');
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const colRef = collection(db, 'users', uid, 'recipes');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: d.name || '',
            nameEn: d.nameEn || '',
            category: (d.category || 'regular') as RecipeCategory,
            ingredients: (d.ingredients || []) as RecipeIngredient[],
            subRecipeIds: d.subRecipeIds || [],
            isSubRecipe: d.isSubRecipe || false,
            servings: d.servings || 1,
            packagingCost: d.packagingCost || 0,
            overheadPercentage: d.overheadPercentage || 0,
            profitMarginPercentage: d.profitMarginPercentage || 0,
            notes: d.notes || '',
            createdAt: d.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          } as Recipe;
        });
        setRecipes(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching recipes:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const addRecipe = useCallback(
    async (data: {
      name: string;
      nameEn?: string;
      category: RecipeCategory;
      ingredients: RecipeIngredient[];
      subRecipeIds?: string[];
      isSubRecipe?: boolean;
      servings?: number;
      packagingCost: number;
      overheadPercentage: number;
      profitMarginPercentage: number;
      notes?: string;
    }) => {
      await addDoc(getUserCollection(), {
        name: data.name,
        nameEn: data.nameEn || '',
        category: data.category,
        ingredients: data.ingredients,
        subRecipeIds: data.subRecipeIds || [],
        isSubRecipe: data.isSubRecipe || false,
        servings: data.servings || 1,
        packagingCost: data.packagingCost,
        overheadPercentage: data.overheadPercentage,
        profitMarginPercentage: data.profitMarginPercentage,
        notes: data.notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  const updateRecipe = useCallback(
    async (
      id: string,
      data: {
        name: string;
        nameEn?: string;
        category: RecipeCategory;
        ingredients: RecipeIngredient[];
        subRecipeIds?: string[];
        isSubRecipe?: boolean;
        servings?: number;
        packagingCost: number;
        overheadPercentage: number;
        profitMarginPercentage: number;
        notes?: string;
      }
    ) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      await updateDoc(doc(db, 'users', uid, 'recipes', id), {
        name: data.name,
        nameEn: data.nameEn || '',
        category: data.category,
        ingredients: data.ingredients,
        subRecipeIds: data.subRecipeIds || [],
        isSubRecipe: data.isSubRecipe || false,
        servings: data.servings || 1,
        packagingCost: data.packagingCost,
        overheadPercentage: data.overheadPercentage,
        profitMarginPercentage: data.profitMarginPercentage,
        notes: data.notes || '',
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  const deleteRecipe = useCallback(async (id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'recipes', id));
  }, []);

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe };
}
