"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Form, FormField } from "@workspace/ui/components/form";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { cn } from "@workspace/ui/lib/utils";

import { ConversationStatusButton } from "../components/conversation-status-button";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

interface ConversationIdViewProps {
  conversationId: Id<"conversations">;
}

export const ConversationIdViewLoading = () => {
  const widths = ["w-[48%]", "w-[60%]", "w-[72%]"];

  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {Array.from({ length: 8 }).map((_, index) => {
            const isUser = index % 2 === 1;
            const width =
              widths[index % widths.length] ?? ("w-[60%]" as string);

            return (
              <div
                className={cn(
                  "group flex w-full items-end justify-end gap-2 py-2",
                  "[&>div]:max-w-[80%]",
                  isUser ? "is-user" : "is-assistant flex-row-reverse justify-end",
                )}
                key={index}
              >
                <Skeleton
                  className={cn("h-9 rounded-lg bg-neutral-200", width)}
                />
                <Skeleton className="size-8 rounded-full bg-neutral-200" />
              </div>
            );
          })}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      <div className="p-2">
        <AIInput>
          <AIInputTextarea
            disabled
            placeholder="Type your response as an operator..."
          />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit disabled status="ready" type="submit" />
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  );
};

export const ConversationIdView = ({
  conversationId,
}: ConversationIdViewProps) => {
  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  });

  const threadMessages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId
      ? { threadId: conversation.threadId }
      : "skip",
    { initialNumItems: 10 },
  );

  const {
    canLoadMore,
    handleLoadMore,
    isLoadingFirstPage,
    isLoadingMore,
    topElementRef,
  } = useInfiniteScroll({
    status: threadMessages.status,
    loadMore: threadMessages.loadMore,
    loadSize: 10,
  });

  const createMessage = useMutation(api.private.messages.create);
  const enhanceResponseAction = useAction(api.private.messages.enhanceResponse);
  const updateConversationStatus = useMutation(
    api.private.conversations.updateStatus,
  );

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  const handleToggleStatus = async () => {
    if (!conversation) {
      return;
    }

    let newStatus: "escalated" | "resolved" | "unresolved";

    if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else if (conversation.status === "escalated") {
      newStatus = "resolved";
    } else {
      newStatus = "unresolved";
    }

    setIsUpdatingStatus(true);
    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEnhanceResponse = async () => {
    if (!conversation) {
      return;
    }

    setIsEnhancing(true);
    try {
      const currentValue = form.getValues("message");
      const response = await enhanceResponseAction({
        prompt: currentValue,
        threadId: conversation.threadId,
      });
      form.setValue("message", response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessage({
        conversationId,
        prompt: values.message,
      });
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  if (conversation === undefined || isLoadingFirstPage) {
    return <ConversationIdViewLoading />;
  }

  const uiMessages = toUIMessages(threadMessages.results ?? []);

  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
        <ConversationStatusButton
          disabled={isUpdatingStatus}
          onClick={handleToggleStatus}
          status={conversation.status}
        />
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          <InfiniteScrollTrigger
            ref={topElementRef}
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
          {uiMessages.map((message) => (
            <AIMessage
              from={message.role === "user" ? "assistant" : "user"}
              key={message.id}
            >
              <AIMessageContent>
                <AIResponse>{message.content}</AIResponse>
              </AIMessageContent>
              {message.role === "user" && (
                <DicebearAvatar
                  seed={conversation.contactSession._id}
                  size={32}
                />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      <div className="p-2">
        <Form {...form}>
          <AIInput onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              disabled={conversation.status === "resolved"}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={
                    conversation.status === "resolved" ||
                    form.formState.isSubmitting ||
                    isEnhancing
                  }
                  onChange={field.onChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation.status === "resolved"
                      ? "This conversation has been resolved."
                      : "Type your response as an operator..."
                  }
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton
                  disabled={
                    conversation.status === "resolved" ||
                    isEnhancing ||
                    !form.formState.isValid
                  }
                  onClick={handleEnhanceResponse}
                  variant="ghost"
                >
                  <Wand2Icon />
                  {isEnhancing ? "Enhancing..." : "Enhance"}
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={
                  conversation.status === "resolved" ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting
                }
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  );
};
