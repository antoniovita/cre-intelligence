interface BrandProps {
  subtitle?: string;
  className?: string;
  /** Use on dark/photo backgrounds to swap text colors for light ones. */
  inverted?: boolean;
}

/**
 * "CRE Intelligence" wordmark — icon, name and subtitle — shared between
 * the admin sidebar and any other screen (e.g. family lookup) so both
 * carry the same visual identity.
 */
export function Brand({ subtitle, className = "", inverted = false }: BrandProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
          <circle cx="16" cy="16" r="15" fill="#dbeafe" />
          <circle cx="16" cy="16" r="6.5" fill="#2563eb" />
          <circle cx="16" cy="16" r="2.4" fill="#ffffff" />
        </svg>
        <span
          className={`text-[19px] font-semibold tracking-tight ${
            inverted ? "text-white" : "text-slate-900"
          }`}
        >
          CRE Intelligence
        </span>
      </div>
      {subtitle && (
        <span
          className={`pl-6.5 text-[10px] uppercase tracking-wide ${
            inverted ? "text-blue-100/80" : "text-slate-400"
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
