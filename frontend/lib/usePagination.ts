"use client";

import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

/**
 * Client-side pagination over an already-filtered list. Resets to page 1
 * whenever the list identity changes (e.g. a filter narrowed it) — adjusted
 * during render (React's documented pattern for resetting state in response
 * to a prop change) rather than an effect, so it takes effect in the same
 * render instead of flashing the stale page first.
 */
export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [prevItems, setPrevItems] = useState(items);

  if (items !== prevItems) {
    setPrevItems(items);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, clampedPage, pageSize]);

  return {
    page: clampedPage,
    totalPages,
    pageItems,
    setPage,
    hasMultiplePages: totalPages > 1,
  };
}
