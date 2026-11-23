import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(1024px-91px)] min-w-[1024px] bg-[#f6f7f9] px-[80px] py-[48px] text-[#17191e]">
      <h1 className="text-[24px] font-bold">페이지를 찾을 수 없어요.</h1>
      <Link href="/" className="mt-[16px] inline-block font-bold text-[#2563eb]">영화 목록으로 돌아가기</Link>
    </main>
  );
}
