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
import { onAuthStateChanged } from 'firebase/auth';
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
    // Listen for auth state changes so we re-subscribe when the user logs in
    let unsubFirestore: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up any previous Firestore listener
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }

      if (!user) {
        setRecipes([]);
        setLoading(false);
        return;
      }

      const colRef = collection(db, 'users', user.uid, 'recipes');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      setLoading(true);
      unsubFirestore = onSnapshot(
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
              noteImages: d.noteImages || [],
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
    });

    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
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
      noteImages?: string[];
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
        noteImages: data.noteImages || [],
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
        noteImages?: string[];
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
        noteImages: data.noteImages || [],
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

