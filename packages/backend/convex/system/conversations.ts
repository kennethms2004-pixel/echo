import { ConvexError, v } from "convex/values";

import { internalMutation, internalQuery } from "../_generated/server";
import { supportAgent } from "./ai/agents/supportAgent";

export const getByThreadId = internalQuery({
  args: {
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    return conversation;
  }
});

export const getByThreadIdForOrg = internalQuery({
  args: {
    threadId: v.string(),
    organizationId: v.string()
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    if (!conversation || conversation.organizationId !== args.organizationId) {
      return null;
    }

    return conversation;
  }
});

export const patchLastMessageSnapshot = internalMutation({
  args: {
    threadId: v.string(),
    text: v.optional(v.string()),
    messageRole: v.string()
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    if (!conversation) {
      return;
    }

    await ctx.db.patch(conversation._id, {
      lastMessageSnapshot: {
        text: args.text,
        message: { role: args.messageRole }
      }
    });
  }
});

export const peekLatestMessageForThread = internalQuery({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: { numItems: 1, cursor: null }
    });
    const doc = paginated.page[0];
    if (!doc) {
      return null;
    }
    const role = doc.message?.role ?? "assistant";
    return { text: doc.text, messageRole: role };
  }
});

export const resolve = internalMutation({
  args: {
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found"
      });
    }

    await ctx.db.patch(conversation._id, { status: "resolved" });
  }
});

export const escalate = internalMutation({
  args: {
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique();

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found"
      });
    }

    await ctx.db.patch(conversation._id, { status: "escalated" });
  }
});
