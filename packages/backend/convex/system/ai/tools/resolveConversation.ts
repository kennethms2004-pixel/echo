import { createTool } from "@convex-dev/agent";
import { z } from "zod";

import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";

export const resolveConversationTool = createTool({
  description: "Resolve a conversation.",
  args: z.object({}),
  handler: async (ctx, _args) => {
    if (!ctx.threadId) {
      throw new Error("Missing thread ID");
    }

    await ctx.runMutation(internal.system.conversations.resolve, {
      threadId: ctx.threadId
    });

    const content = "Conversation resolved.";

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content
      }
    });

    await ctx.runMutation(internal.system.conversations.patchLastMessageSnapshot, {
      threadId: ctx.threadId,
      text: content,
      messageRole: "assistant"
    });

    return "Conversation resolved.";
  }
});
