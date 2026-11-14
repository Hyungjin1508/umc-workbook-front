import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type SubmitEvent } from "react";
import { getMemberRatings } from "@/api/ratings/get-member-ratings";
import type { Rating } from "@/api/ratings/models";
import { useMemberId } from "@/hooks/use-member-id";
import { useRatingMutation } from "@/hooks/use-rating-mutation";
import { ratingKeys } from "@/utils/query-keys";

export function MovieRatingSection({ movieId }: { movieId: number }) {
  const memberId = useMemberId();
  const ratingsQuery = useQuery({
    queryKey: ratingKeys.member(memberId),
    queryFn: () => getMemberRatings(memberId!),
    enabled: memberId !== null,
    staleTime: 60 * 1000,
    retry: false,
  });
  const rating = ratingsQuery.data?.find((item) => item.movieId === movieId);

  return (
    <section className="mx-[80px] my-[40px] rounded-[12px] border border-[#e3e6eb] bg-white p-[24px]" aria-labelledby="my-rating-heading">
      <h2 id="my-rating-heading" className="mb-[20px] text-[22px] font-bold">내 평점과 후기</h2>
      {memberId === null ? (
        <p className="text-[14px] text-[#606774]">로그인 후 평점과 후기를 작성할 수 있어요. <Link to="/login" className="font-bold text-[#2563eb]">로그인</Link></p>
      ) : ratingsQuery.isPending ? (
        <p role="status">내 평점을 불러오는 중이에요.</p>
      ) : ratingsQuery.isError ? (
        <div><p role="alert">내 평점을 불러오지 못했어요.</p><button type="button" onClick={() => ratingsQuery.refetch()} className="mt-[12px] cursor-pointer font-bold text-[#2563eb]">다시 시도</button></div>
      ) : (
        <RatingForm key={JSON.stringify([memberId, movieId, rating ?? null])} memberId={memberId} movieId={movieId} rating={rating} />
      )}
    </section>
  );
}

function RatingForm({ memberId, movieId, rating }: { memberId: number; movieId: number; rating?: Rating }) {
  const [score, setScore] = useState(rating?.score ?? 0);
  const [comment, setComment] = useState(rating?.comment ?? "");
  const mutation = useRatingMutation(memberId, movieId);
  const canSubmit = Number.isInteger(score) && score >= 1 && score <= 5 && comment.length <= 500;
  const fieldClass = "rounded-[8px] border border-[#e3e6eb] bg-white p-[12px] text-[14px] outline-none focus:border-[#2563eb] disabled:opacity-50";
  const buttonClass = "cursor-pointer rounded-[8px] px-[18px] py-[10px] text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-50";

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || mutation.isPending) return;
    const fields = { score, comment: comment.trim() };
    mutation.mutate(rating ? { type: "update", ratingId: rating.ratingId, fields } : { type: "create", fields });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-[640px] flex-col gap-[12px]">
      <p className="text-[14px] text-[#606774]">{rating ? `등록한 평점: ${rating.score}점 · 아래에서 수정하거나 삭제할 수 있어요.` : "아직 작성한 평점이 없어요."}</p>
      <label htmlFor="rating-score" className="text-[14px] font-bold">별점</label>
      <select id="rating-score" value={score} onChange={(event) => setScore(Number(event.target.value))} disabled={mutation.isPending} className={fieldClass}>
        <option value={0}>별점을 선택해 주세요</option>
        {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}점</option>)}
      </select>
      <label htmlFor="rating-comment" className="text-[14px] font-bold">후기 (선택)</label>
      <textarea id="rating-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} rows={4} disabled={mutation.isPending} className={fieldClass} aria-describedby="rating-comment-count" placeholder="이 영화에 대한 후기를 남겨 주세요." />
      <p id="rating-comment-count" className="text-right text-[12px] text-[#606774]">{comment.length} / 500자</p>
      {mutation.isError && <p role="alert" className="text-[13px] text-red-600">평점 요청에 실패했어요. 입력값을 확인하고 다시 시도해 주세요.</p>}
      <div className="flex gap-[10px]">
        <button type="submit" disabled={!canSubmit || mutation.isPending} className={`${buttonClass} bg-[#2563eb] text-white`}>{mutation.isPending ? "처리 중" : rating ? "수정" : "등록"}</button>
        {rating && <button type="button" disabled={mutation.isPending} className={`${buttonClass} border border-red-500 text-red-600`} onClick={() => {
          if (confirm("작성한 평점과 후기를 삭제할까요?")) mutation.mutate({ type: "delete", ratingId: rating.ratingId });
        }}>삭제</button>}
      </div>
    </form>
  );
}
