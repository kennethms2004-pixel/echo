"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
  status: "CanLoadMore" | "LoadingMore" | "Exhausted" | "LoadingFirstPage";
  loadMore: (numItems: number) => void;
  loadSize?: number;
  observerEnabled?: boolean;
  /** When set, intersection is computed against this element (e.g. chat scroller) instead of the viewport. */
  intersectionRoot?: HTMLElement | null;
}

export const useInfiniteScroll = ({
  status,
  loadMore,
  loadSize = 10,
  observerEnabled = true,
  intersectionRoot
}: UseInfiniteScrollProps) => {
  const topElementRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(loadSize);
    }
  }, [status, loadMore, loadSize]);

  useEffect(() => {
    const topElement = topElementRef.current;

    const rootReady =
      intersectionRoot === undefined || intersectionRoot !== null;

    if (!topElement || !observerEnabled || !rootReady) {
      return;
    }

    const init: IntersectionObserverInit = { threshold: 0.1 };
    if (intersectionRoot !== undefined && intersectionRoot !== null) {
      init.root = intersectionRoot;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        handleLoadMore();
      }
    }, init);

    observer.observe(topElement);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, observerEnabled, intersectionRoot]);

  return {
    topElementRef,
    handleLoadMore,
    canLoadMore: status === "CanLoadMore",
    isLoadingMore: status === "LoadingMore",
    isLoadingFirstPage: status === "LoadingFirstPage",
    isExhausted: status === "Exhausted"
  };
};
