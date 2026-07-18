import { useEffect, useState } from "react";

const STORAGE_KEY = "ibn_bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  const addBookmark = (id: number) => {
    const next = [...bookmarks, id];
    setBookmarks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const removeBookmark = (id: number) => {
    const next = bookmarks.filter(b => b !== id);
    setBookmarks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const isBookmarked = (id: number) => bookmarks.includes(id);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked
  };
}
