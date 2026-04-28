import { createTool } from "@convex-dev/agent";
import { z } from "zod";

import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";

export const escalateConversationTool = createTool({
  description: "Escalate a conversation.",
  args: z.object({}),
  handler: async (ctx, _args) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    await ctx.runMutation(internal.system.conversations.escalate, {
      threadId: ctx.threadId
    });

    const content = "Conversation escalated to a human operator.";

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

    return "Conversation escalated to a human operator.";
  }
});
