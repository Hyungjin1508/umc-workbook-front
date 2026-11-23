"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-[calc(1024px-91px)] min-w-[1024px] bg-[#f6f7f9] px-[80px] py-[48px] text-[#17191e]">
      <p role="alert">화면을 불러오지 못했어요. 다시 시도해 주세요.</p>
      <button type="button" onClick={reset} className="mt-[16px] cursor-pointer font-bold text-[#2563eb]">다시 시도</button>
    </main>
  );
}
