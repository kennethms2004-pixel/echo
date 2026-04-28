"use client";

import { usePaginatedQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon } from "lucide-react";

import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";

import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  screenAtom
} from "@/modules/widget/atoms/widget-atoms";
import { useWidgetOrganizationId } from "@/modules/widget/context/widget-organization-context";
import { previewFromLastMessage } from "@/modules/widget/lib/message-preview";
import { WidgetFooter } from "@/modules/widget/ui/components/widget-footer";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

export const WidgetInboxScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const organizationId = useWidgetOrganizationId();
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId)
  );

  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId ? { contactSessionId } : "skip",
    { initialNumItems: 10 }
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingFirstPage,
    isLoadingMore
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10
  });

  const inboxRows = conversations.results ?? [];

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            onClick={() => setScreen("selection")}
            size="icon"
            variant="transparent"
          >
            <ArrowLeftIcon />
          </Button>
          <p>Inbox</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-2 overflow-y-auto p-4">
        {!contactSessionId ? (
          <p className="text-muted-foreground mx-auto mt-10 max-w-[18rem] text-center text-sm">
            Session missing. Go back and sign in again so your inbox can load.
          </p>
        ) : null}
        {contactSessionId && isLoadingFirstPage ? (
          <p className="text-muted-foreground mx-auto mt-10 text-center text-sm">
            Loading chats…
          </p>
        ) : null}
        {contactSessionId &&
        !isLoadingFirstPage &&
        inboxRows.length === 0 ? (
          <p className="text-muted-foreground mx-auto mt-10 text-center text-sm">
            No chats yet. Start one from Home.
          </p>
        ) : null}
        {inboxRows.length > 0 &&
          inboxRows.map((conversation) => (
            <Button
              className="h-20 w-full justify-between"
              key={conversation._id}
              onClick={() => {
                setConversationId(conversation._id);
                setScreen("chat");
              }}
              variant="outline"
            >
              <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="text-muted-foreground text-xs">Chat</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(conversation._creationTime))}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="truncate text-sm">
                    {previewFromLastMessage(conversation.lastMessage) ||
                      "No preview"}
                  </p>
                  <ConversationStatusIcon status={conversation.status} />
                </div>
              </div>
            </Button>
          ))}
        {contactSessionId ? (
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
        ) : null}
      </div>
      <WidgetFooter />
    </>
  );
};
