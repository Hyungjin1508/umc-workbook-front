import { useNavigate } from "@tanstack/react-router";
import { useFavorite } from "@/hooks/use-favorite";
import { cn } from "../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
  movieTitle: string;
  variant?: "icon" | "text";
  className?: string;
}

export function BookmarkButton({ movieId, movieTitle, variant = "text", className }: BookmarkButtonProps) {
  const navigate = useNavigate();
  const { memberId, query, isFavorite: isBookmarked, mutation, isChanging } = useFavorite(movieId, variant === "text");
  const isBusy = memberId !== null && (query.isLoading || isChanging);
  const hasError = memberId !== null && (query.isError || mutation.isError);

  function handleClick() {
    if (memberId === null) {
      alert("로그인 후 즐겨찾기를 사용할 수 있어요.");
      navigate({ to: "/login" });
      return;
    }
    if (isBusy) return;
    if (query.isError) {
      void query.refetch();
      return;
    }
    mutation.mutate(isBookmarked);
  }

  return (
    <button
      type="button"
      aria-label={`${movieTitle} ${query.isError ? "즐겨찾기 조회 다시 시도" : isBookmarked ? "북마크 해제" : "북마크 추가"}`}
      aria-pressed={isBookmarked}
      aria-busy={isBusy}
      disabled={isBusy}
      title={hasError ? "즐겨찾기 요청에 실패했어요. 클릭해서 다시 시도해 주세요." : undefined}
      onClick={handleClick}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-[6px] rounded-[8px] border p-0 text-[13px] font-bold transition-colors disabled:cursor-wait disabled:opacity-50",
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
      {variant === "text" && (isBusy ? "처리 중" : hasError ? "즐겨찾기 다시 시도" : isBookmarked ? "북마크 해제" : "북마크 추가")}
      {variant === "icon" && hasError && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1 text-[10px] text-white" aria-hidden="true">!</span>}
    </button>
  );
}
