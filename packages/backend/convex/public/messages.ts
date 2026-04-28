import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import { action, query } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { escalateConversationTool } from "../system/ai/tools/escalateConversation";
import { resolveConversationTool } from "../system/ai/tools/resolveConversation";

export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id("contactSessions")
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.runQuery(
      internal.system.contactSessions.getOne,
      { contactSessionId: args.contactSessionId }
    );

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session"
      });
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: args.threadId }
    );

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found"
      });
    }

    if (
      conversation.contactSessionId !== contactSession._id ||
      conversation.organizationId !== contactSession.organizationId
    ) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Conversation does not belong to this session"
      });
    }

    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved"
      });
    }

    // TODO(entitlements): Gate on active subscription / plan (e.g. hasActiveSubscription(orgId))
    // before agent runs or messages persist; add tests for allowed vs blocked once billing exists.

    const shouldTriggerAgent = conversation.status === "unresolved";

    if (shouldTriggerAgent) {
      await supportAgent.generateText(
        ctx,
        { threadId: args.threadId },
        {
          prompt: args.prompt,
          tools: {
            resolveConversation: resolveConversationTool,
            escalateConversation: escalateConversationTool
          }
        }
      );

      const latest = await ctx.runQuery(
        internal.system.conversations.peekLatestMessageForThread,
        { threadId: args.threadId }
      );
      if (latest) {
        await ctx.runMutation(
          internal.system.conversations.patchLastMessageSnapshot,
          {
            threadId: args.threadId,
            text: latest.text,
            messageRole: latest.messageRole
          }
        );
      }
    } else {
      await supportAgent.saveMessage(ctx, {
        threadId: args.threadId,
        message: { role: "user", content: args.prompt }
      });
      await ctx.runMutation(internal.system.conversations.patchLastMessageSnapshot, {
        threadId: args.threadId,
        text: args.prompt,
        messageRole: "user"
      });
    }
  }
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    contactSessionId: v.id("contactSessions")
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session"
      });
    }

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    if (
      !conversation ||
      conversation.contactSessionId !== contactSession._id ||
      conversation.organizationId !== contactSession.organizationId
    ) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Incorrect session"
      });
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts
    });

    return paginated;
  }
});
