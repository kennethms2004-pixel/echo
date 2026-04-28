"use client";

import type { Ref } from "react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface InfiniteScrollTriggerProps {
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  loadMoreText?: string;
  noMoreText?: string;
  /** When false and the list is exhausted, only a sentinel is rendered (for non-chat lists). @default true */
  showExhaustedHint?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export const InfiniteScrollTrigger = ({
  canLoadMore,
  isLoadingMore,
  onLoadMore,
  loadMoreText = "Load more",
  noMoreText = "Beginning of conversation",
  showExhaustedHint = true,
  className,
  ref
}: InfiniteScrollTriggerProps) => {
  if (!canLoadMore && !isLoadingMore) {
    if (!showExhaustedHint) {
      return (
        <div
          aria-hidden
          className={cn("h-1 w-full shrink-0", className)}
          ref={ref}
        />
      );
    }

    return (
      <div
        className={cn(
          "flex w-full items-center gap-3 px-2 py-4 text-muted-foreground text-xs",
          className
        )}
        ref={ref}
      >
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span className="shrink-0">{noMoreText}</span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
    );
  }

  const text = isLoadingMore ? "Loading..." : loadMoreText;

  return (
    <div
      className={cn("flex w-full justify-center py-2", className)}
      ref={ref}
    >
      <Button
        disabled={isLoadingMore}
        onClick={onLoadMore}
        size="sm"
        variant="ghost"
      >
        {text}
      </Button>
    </div>
  );
};
