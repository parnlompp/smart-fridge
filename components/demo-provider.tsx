"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { calculateDeduction } from "@/lib/business/deduction";
import { filterRecipes } from "@/lib/business/filtering";
import { calculateMatch, nearExpiryUsed } from "@/lib/business/matching";
import { calculateRankScore, rankRecipes } from "@/lib/business/ranking";
import {
  demoHistory,
  demoInventory,
  demoProfile,
  demoShopping,
  recipes,
} from "@/lib/demo-data";
import type {
  HistoryItem,
  InventoryItem,
  Profile,
  RecipeAnalysis,
  ShoppingItem,
} from "@/lib/types";

interface DemoContextValue {
  profile: Profile;
  setProfile: (p: Profile) => void;
  inventory: InventoryItem[];
  addInventory: (i: InventoryItem) => void;
  updateInventory: (i: InventoryItem) => void;
  deleteInventory: (id: string) => void;
  analyses: RecipeAnalysis[];
  shopping: ShoppingItem[];
  addShopping: (items: ShoppingItem[]) => void;
  toggleShopping: (id: string) => void;
  deleteShopping: (id: string) => void;
  clearCompleted: () => void;
  history: HistoryItem[];
  cook: (
    recipeId: string,
    servings: number,
  ) => ReturnType<typeof calculateDeduction>;
  reset: () => void;
}
const DemoContext = createContext<DemoContextValue | null>(null);
const STORAGE_KEY = "smart-fridge-demo-v1";

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState(demoProfile);
  const [inventory, setInventory] = useState(demoInventory);
  const [shopping, setShopping] = useState(demoShopping);
  const [history, setHistory] = useState(demoHistory);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setProfileState(data.profile);
        setInventory(data.inventory);
        setShopping(data.shopping);
        setHistory(data.history);
      }
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    if (loaded)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile, inventory, shopping, history }),
      );
  }, [profile, inventory, shopping, history, loaded]);
  const analyses = useMemo(
    () =>
      rankRecipes(
        filterRecipes(
          recipes,
          profile.allergies,
          profile.dietaryPreference,
        ).map((recipe) => {
          const match = calculateMatch(recipe, inventory);
          const nearExpiry = nearExpiryUsed(recipe, inventory);
          return {
            recipe,
            ...match,
            nearExpiry,
            score: calculateRankScore(
              match.percentage,
              nearExpiry.length,
              match.missing.length,
              recipe.preparationTime,
            ),
          };
        }),
      ),
    [inventory, profile],
  );
  const value: DemoContextValue = {
    profile,
    setProfile: setProfileState,
    inventory,
    addInventory: (item) => setInventory((v) => [item, ...v]),
    updateInventory: (item) =>
      setInventory((v) => v.map((x) => (x.id === item.id ? item : x))),
    deleteInventory: (id) => setInventory((v) => v.filter((x) => x.id !== id)),
    analyses,
    shopping,
    addShopping: (items) =>
      setShopping((v) => [
        ...v,
        ...items.filter(
          (item) => !v.some((x) => x.name === item.name && !x.isPurchased),
        ),
      ]),
    toggleShopping: (id) =>
      setShopping((v) =>
        v.map((x) => (x.id === id ? { ...x, isPurchased: !x.isPurchased } : x)),
      ),
    deleteShopping: (id) => setShopping((v) => v.filter((x) => x.id !== id)),
    clearCompleted: () => setShopping((v) => v.filter((x) => !x.isPurchased)),
    history,
    cook: (id, servings) => {
      const recipe = recipes.find((x) => x.id === id)!;
      const result = calculateDeduction(recipe, inventory, servings);
      if (result.ok) {
        setInventory(result.inventory);
        setHistory((v) => [
          {
            id: crypto.randomUUID(),
            recipeId: id,
            recipeName: recipe.name,
            cookedAt: new Date().toISOString(),
            servings,
            summary: result.summary,
          },
          ...v,
        ]);
      }
      return result;
    },
    reset: () => {
      setProfileState(demoProfile);
      setInventory(demoInventory);
      setShopping(demoShopping);
      setHistory(demoHistory);
      localStorage.removeItem(STORAGE_KEY);
    },
  };
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used within DemoProvider");
  return value;
}
