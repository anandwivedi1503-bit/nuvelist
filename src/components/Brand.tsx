export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30" fill="none" stroke="#1a6e78" strokeWidth="5" />
      <circle cx="32" cy="32" r="18" fill="#0d2c3f" />
    </svg>
  );
}

export function BrandLockup({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark className={compact ? "h-8 w-8" : "h-10 w-10"} />
      <span className="leading-none">
        <span className={`block font-semibold tracking-tight text-[22px] ${light ? "text-white" : "text-navy"}`}>
          nuvelist
        </span>
        {!compact && (
          <span className={`mt-1 block text-[10px] uppercase tracking-[0.28em] ${light ? "text-white/60" : "text-muted"}`}>
            Clinical Skin Actives
          </span>
        )}
      </span>
    </span>
  );
}
