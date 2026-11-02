export function TmdbAttribution() {
  return (
    <footer className="mt-auto flex min-h-[57px] w-full items-center justify-end gap-[8px] bg-white px-[80px] py-[16px]">
      <img className="h-[24px] w-[24px] object-contain" src="/images/logos/tmdb-logo.svg" alt="TMDB" />
      <p className="m-0 text-[12px] font-normal leading-[14px] text-[#606774]">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}
