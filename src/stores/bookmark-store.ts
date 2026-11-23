//bookmark-store.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { readBookmarkIds } from "../utils/bookmark-storage";
import { clientStorage } from "@/utils/client-storage";

interface BookmarkStore {
  bookmarkedMovieIds: number[];
  toggleBookmark: (movieId: number) => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set) => ({
      // 서버와 브라우저의 첫 화면은 같은 초기값으로 시작해요.
      bookmarkedMovieIds: [],
      toggleBookmark: (movieId) =>
        set((state) => ({
          bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
            ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
            : [...state.bookmarkedMovieIds, movieId],
        })),
    }),
    {
      name: "umcine-bookmark-store",
      storage: createJSONStorage(() => clientStorage),
      skipHydration: true,
      merge: (persistedState, currentState) => {
        const storedIds = (persistedState as Partial<BookmarkStore> | undefined)?.bookmarkedMovieIds;
        const ids = Array.isArray(storedIds) ? storedIds : readBookmarkIds();
        return {
          ...currentState,
          bookmarkedMovieIds: ids.filter((id): id is number =>
            typeof id === "number" && Number.isInteger(id) && id > 0),
        };
      },
      partialize: (state) => ({
        bookmarkedMovieIds: state.bookmarkedMovieIds,
      }),
    },
  ),
);
