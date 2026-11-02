//bookmark-store.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { readBookmarkIds } from "../utils/bookmark-storage";

interface BookmarkStore {
  bookmarkedMovieIds: number[];
  toggleBookmark: (movieId: number) => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set) => ({
      // Zustand에 저장된 값이 없으면 이전 과제의 북마크를 초기값으로 사용해요.
      bookmarkedMovieIds: readBookmarkIds(),
      toggleBookmark: (movieId) =>
        set((state) => ({
          bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
            ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
            : [...state.bookmarkedMovieIds, movieId],
        })),
    }),
    {
      name: "umcine-bookmark-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        bookmarkedMovieIds: state.bookmarkedMovieIds,
      }),
    },
  ),
);
