"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useQuery } from "convex/react";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "@workspace/backend/_generated/api";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Form, FormField } from "@workspace/ui/components/form";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";

import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  screenAtom
} from "@/modules/widget/atoms/widget-atoms";
import { useWidgetOrganizationId } from "@/modules/widget/context/widget-organization-context";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

const formSchema = z.object({
  message: z.string().min(1, "Message is required")
});

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useWidgetOrganizationId();
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId)
  );

  const conversationArgs = useMemo(
    () =>
      conversationId && contactSessionId
        ? { conversationId, contactSessionId }
        : ("skip" as const),
    [conversationId, contactSessionId]
  );

  const conversation = useQuery(api.public.conversations.getOne, conversationArgs);

  const threadMessagesArgs = useMemo(
    () =>
      conversation?.threadId && contactSessionId
        ? { threadId: conversation.threadId, contactSessionId }
        : ("skip" as const),
    [conversation?.threadId, contactSessionId]
  );

  const messages = useThreadMessages(api.public.messages.getMany, threadMessagesArgs, {
    initialNumItems: 10
  });

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingFirstPage,
    isLoadingMore
  } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10
  });

  const createMessage = useAction(api.public.messages.create);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) {
      return;
    }

    await createMessage({
      threadId: conversation.threadId,
      prompt: values.message,
      contactSessionId
    });

    form.reset();
  };

  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  };

  const waitingForConversation =
    Boolean(conversationId && contactSessionId) && conversation === undefined;

  const waitingForMessages =
    Boolean(conversation?.threadId) &&
    (messages.status === "LoadingFirstPage" || isLoadingFirstPage);

  const showChatLoading = waitingForConversation || waitingForMessages;

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button size="icon" variant="transparent" onClick={onBack}>
            <ArrowLeftIcon />
          </Button>
          <p>Chat</p>
        </div>
        <Button size="icon" variant="transparent">
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <AIConversation>
        <AIConversationContent>
          {showChatLoading ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm">
              <span>
                {waitingForConversation
                  ? "Loading conversation…"
                  : "Loading messages…"}
              </span>
            </div>
          ) : (
            <>
              <InfiniteScrollTrigger
                canLoadMore={canLoadMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                ref={topElementRef}
              />
              {toUIMessages(messages.results ?? []).map((message) => (
                <AIMessage
                  from={message.role === "user" ? "user" : "assistant"}
                  key={message.id}
                >
                  <AIMessageContent>
                    <AIResponse>{message.content}</AIResponse>
                  </AIMessageContent>
                  {message.role === "assistant" && (
                    <DicebearAvatar
                      imageUrl="/logo.svg"
                      seed="assistant"
                      size={32}
                    />
                  )}
                </AIMessage>
              ))}
            </>
          )}
        </AIConversationContent>
        <AIConversationScrollButton />
        {/* TODO: add suggestions */}
      </AIConversation>
      <Form {...form}>
        <AIInput
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-none border-x-0 border-b-0"
        >
          <FormField
            control={form.control}
            disabled={conversation?.status === "resolved"}
            name="message"
            render={({ field }) => (
              <AIInputTextarea
                disabled={conversation?.status === "resolved"}
                onChange={field.onChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
                placeholder={
                  conversation?.status === "resolved"
                    ? "This conversation has been resolved."
                    : "Type your message..."
                }
                value={field.value}
              />
            )}
          />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit
              disabled={
                conversation?.status === "resolved" || !form.formState.isValid
              }
              status="ready"
              type="submit"
            />
          </AIInputToolbar>
        </AIInput>
      </Form>
    </>
  );
};
