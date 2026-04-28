"use client";

import { useRef } from "react";
import { usePaginatedQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useAtomValue, useSetAtom } from "jotai";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CornerUpLeftIcon,
  ListIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { api } from "@workspace/backend/_generated/api";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { cn } from "@workspace/ui/lib/utils";

import { statusFilterAtom } from "@/modules/dashboard/atoms";
import {
  getCountryFlagUrl,
  getCountryFromTimezone
} from "@/lib/country-utils";

export const ConversationsPanel = () => {
  const pathname = usePathname();
  const statusFilter = useAtomValue(statusFilterAtom);
  const setStatusFilter = useSetAtom(statusFilterAtom);

  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    {
      status: statusFilter === "all" ? undefined : statusFilter
    },
    { initialNumItems: 10 }
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
    isLoadingFirstPage
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10
  });

  const listScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-background text-sidebar-foreground">
      <div className="shrink-0 flex flex-col gap-3.5 border-b p-2">
        <Select
          defaultValue="all"
          onValueChange={(value) =>
            setStatusFilter(
              value as "unresolved" | "escalated" | "resolved" | "all"
            )
          }
          value={statusFilter}
        >
          <SelectTrigger className="h-8 border-none px-1.5 shadow-none ring-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="unresolved">
              <div className="flex items-center gap-2">
                <ArrowRightIcon className="size-4" />
                <span>Unresolved</span>
              </div>
            </SelectItem>
            <SelectItem value="escalated">
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="size-4" />
                <span>Escalated</span>
              </div>
            </SelectItem>
            <SelectItem value="resolved">
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4" />
                <span>Resolved</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <div
          ref={listScrollRef}
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-auto [-webkit-overflow-scrolling:touch]"
        >
          <SkeletonConversations />
        </div>
      ) : (
        <div
          ref={listScrollRef}
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-auto [-webkit-overflow-scrolling:touch]"
        >
          <div className="flex min-w-0 w-full flex-col text-sm">
            {conversations?.results.map((conversation) => {
              const isLastMessageFromOperator =
                conversation.lastMessage?.message?.role === "assistant";

              const country = getCountryFromTimezone(
                conversation.contactSession.metadata?.timezone
              );

              const countryFlagUrl = country?.code
                ? getCountryFlagUrl(country.code)
                : undefined;

              return (
                <Link
                  className={cn(
                    "relative flex min-w-0 max-w-full cursor-pointer items-start gap-3 overflow-hidden border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground",
                    pathname === `/conversations/${conversation._id}` &&
                      "bg-accent text-accent-foreground"
                  )}
                  href={`/conversations/${conversation._id}`}
                  key={conversation._id}
                >
                  <div
                    className={cn(
                      "-translate-y-1/2 absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity",
                      pathname === `/conversations/${conversation._id}` &&
                        "opacity-100"
                    )}
                  />
                  <DicebearAvatar
                    badgeImageUrl={countryFlagUrl}
                    className="shrink-0"
                    seed={conversation.contactSession._id}
                    size={40}
                  />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex min-w-0 w-full items-center gap-2">
                      <span className="min-w-0 truncate font-bold">
                        {conversation.contactSession.name}
                      </span>
                      <span className="ml-auto shrink-0 text-muted-foreground text-xs tabular-nums">
                        {formatDistanceToNow(
                          new Date(conversation._creationTime)
                        )}
                      </span>
                    </div>
                    <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
                      <div className="flex w-0 grow items-center gap-1">
                        {isLastMessageFromOperator && (
                          <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            "line-clamp-1 text-muted-foreground text-xs",
                            !isLastMessageFromOperator &&
                              "font-bold text-black"
                          )}
                        >
                          {conversation.lastMessage?.text}
                        </span>
                      </div>
                      <ConversationStatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
              showExhaustedHint={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const SkeletonConversations = () => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="relative flex w-full min-w-0 flex-col">
        <div className="w-full space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              className="flex items-start gap-3 rounded-lg p-4 last:border-b-0"
              key={index}
            >
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-3 w-12 shrink-0" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
