import { openai } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";

import { components } from "../../../_generated/api";

export const supportAgent = new Agent(components.agent, {
  chat: openai.chat("gpt-4o-mini"),
  instructions: `You are a customer support agent.

Use the resolve conversation tool when the user expresses finalization of the conversation.

Use the escalate conversation tool when the user expresses frustration or explicitly requests a human operator.`
});
