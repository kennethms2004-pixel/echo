import { createTool } from "@convex-dev/agent";
import { z } from "zod";

import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";

export const resolveConversationTool = createTool({
  description: "Resolve a conversation.",
  args: z.object({
    reason: z
      .string()
      .optional()
      .describe("Optional short reason why the conversation is being resolved.")
  }),
  handler: async (ctx, _args) => {
    if (!ctx.threadId) {
      throw new Error("Missing thread ID");
    }

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

    await ctx.runMutation(internal.system.conversations.resolve, {
      threadId: ctx.threadId
    });

    return "Conversation resolved.";
  }
});
