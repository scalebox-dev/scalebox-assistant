import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "scalebox_favorites";
const HISTORY_KEY = "scalebox_history";

export interface SavedItem {
  id: string;
  promptId: string;
  title: string;
  category: string;
  content: string;
  savedAt: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<SavedItem[]>([]);
  const [history, setHistory] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [favData, histData] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);
      if (favData) setFavorites(JSON.parse(favData));
      if (histData) setHistory(JSON.parse(histData));
    } catch (e) {
      console.error("Failed to load favorites", e);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = useCallback(async (item: Omit<SavedItem, "id" | "savedAt">) => {
    const newItem: SavedItem = {
      ...item,
      id: `fav_${Date.now()}`,
      savedAt: Date.now(),
    };
    setFavorites((prev) => {
      const updated = [newItem, ...prev];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavorite = useCallback(async (id: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (promptId: string, content: string) => {
      return favorites.some((f) => f.promptId === promptId && f.content === content);
    },
    [favorites],
  );

  const addToHistory = useCallback(async (item: Omit<SavedItem, "id" | "savedAt">) => {
    const newItem: SavedItem = {
      ...item,
      id: `hist_${Date.now()}`,
      savedAt: Date.now(),
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 50); // Keep last 50
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  return {
    favorites,
    history,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    addToHistory,
    clearHistory,
  };
}
