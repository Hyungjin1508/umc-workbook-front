import { useBookmarkStore } from "../stores/bookmark-store";
import { cn } from "../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
  movieTitle: string;
  variant?: "icon" | "text";
  className?: string;
}

export function BookmarkButton({ movieId, movieTitle, variant = "text", className }: BookmarkButtonProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movieId),
  );
  const toggleBookmark = useBookmarkStore(
    (state) => state.toggleBookmark,
  );

  return (
    <button
      type="button"
      aria-label={`${movieTitle} ${isBookmarked ? "북마크 해제" : "북마크 추가"}`}
      aria-pressed={isBookmarked}
      onClick={() => toggleBookmark(movieId)}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-[6px] rounded-[8px] border p-0 text-[13px] font-bold transition-colors",
        variant === "icon" ? "h-[34px] w-[34px]" : "min-h-[38px] px-[12px] py-[8px]",
        isBookmarked
          ? "border-[#2563eb] bg-[#2563eb] text-white"
          : variant === "icon"
            ? "border-white bg-[#17191e] text-white"
            : "border-[#e3e6eb] bg-white text-[#17191e]",
        className,
      )}
    >
      <img
        src={isBookmarked ? "/icons/movie-icons/bookmark.svg" : "/icons/movie-icons/bookmark-outline.svg"}
        alt=""
        className={cn(variant === "icon" ? "h-[24px] w-[24px]" : "h-[18px] w-[18px]", (isBookmarked || variant === "icon") && "invert")}
      />
      {variant === "text" && (isBookmarked ? "북마크 해제" : "북마크 추가")}
    </button>
  );
}
