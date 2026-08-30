"use client";

import { useEffect, useState } from "react";

interface UseJsonDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type State<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

/**
 * Fetches a static JSON file from /public. The three flags are kept in one
 * state object so a URL change resets them together, adjusted during render
 * (React's documented pattern) instead of inside the effect — same approach
 * as usePagination.
 */
export function useJsonData<T>(url: string): UseJsonDataResult<T> {
  const [state, setState] = useState<State<T>>({ status: "loading" });
  const [prevUrl, setPrevUrl] = useState(url);

  if (url !== prevUrl) {
    setPrevUrl(url);
    setState({ status: "loading" });
  }

  useEffect(() => {
    let cancelled = false;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setState({ status: "success", data: json as T });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return {
    data: state.status === "success" ? state.data : null,
    loading: state.status === "loading",
    error: state.status === "error" ? state.message : null,
  };
}
