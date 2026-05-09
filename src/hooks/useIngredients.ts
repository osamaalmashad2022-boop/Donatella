import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { convertToBaseUnit, calcPricePerGram } from '@/lib/calculations';
import type { Ingredient, WeightUnit, IngredientCategory } from '@/types';

function getUserCollection() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return collection(db, 'users', uid, 'ingredients');
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
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
        setIngredients([]);
        setLoading(false);
        return;
      }

      const colRef = collection(db, 'users', user.uid, 'ingredients');
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
              category: (d.category || 'other') as IngredientCategory,
              bulkPrice: d.bulkPrice || 0,
              bulkWeight: d.bulkWeight || 0,
              weightUnit: (d.weightUnit || 'KG') as WeightUnit,
              totalGrams: d.totalGrams || 0,
              pricePerGram: d.pricePerGram || 0,
              createdAt: d.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
              updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            } as Ingredient;
          });
          setIngredients(data);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching ingredients:', error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  const ingredientsMap = useMemo(
    () => new Map<string, Ingredient>(ingredients.map((ing) => [ing.id, ing])),
    [ingredients]
  );

  const addIngredient = useCallback(
    async (data: {
      name: string;
      nameEn?: string;
      category: IngredientCategory;
      bulkPrice: number;
      bulkWeight: number;
      weightUnit: WeightUnit;
    }) => {
      const totalGrams = convertToBaseUnit(data.bulkWeight, data.weightUnit);
      const pricePerGram = calcPricePerGram(data.bulkPrice, totalGrams);

      await addDoc(getUserCollection(), {
        name: data.name,
        nameEn: data.nameEn || '',
        category: data.category,
        bulkPrice: data.bulkPrice,
        bulkWeight: data.bulkWeight,
        weightUnit: data.weightUnit,
        totalGrams,
        pricePerGram,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  const updateIngredient = useCallback(
    async (
      id: string,
      data: {
        name: string;
        nameEn?: string;
        category: IngredientCategory;
        bulkPrice: number;
        bulkWeight: number;
        weightUnit: WeightUnit;
      }
    ) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const totalGrams = convertToBaseUnit(data.bulkWeight, data.weightUnit);
      const pricePerGram = calcPricePerGram(data.bulkPrice, totalGrams);

      await updateDoc(doc(db, 'users', uid, 'ingredients', id), {
        name: data.name,
        nameEn: data.nameEn || '',
        category: data.category,
        bulkPrice: data.bulkPrice,
        bulkWeight: data.bulkWeight,
        weightUnit: data.weightUnit,
        totalGrams,
        pricePerGram,
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  const deleteIngredient = useCallback(async (id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'ingredients', id));
  }, []);

  return {
    ingredients,
    ingredientsMap,
    loading,
    addIngredient,
    updateIngredient,
    deleteIngredient,
  };
}

