export function ProfileAvatar({ image }: { image: string | null }) {
  return (
    <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e3e6eb]">
      {image ? (
        <img src={image} alt="프로필 이미지" className="h-full w-full object-cover" />
      ) : (
        <img src="/icons/movie-icons/person.svg" alt="기본 프로필 이미지" />
      )}
    </div>
  );
}
