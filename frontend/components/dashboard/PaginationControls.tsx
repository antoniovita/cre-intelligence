interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 px-1 pt-3">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-default disabled:opacity-40"
      >
        ← Anterior
      </button>
      <span className="text-xs text-slate-400">
        Página <span className="font-medium text-slate-700">{page}</span> de{" "}
        {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-default disabled:opacity-40"
      >
        Próxima →
      </button>
    </div>
  );
}
