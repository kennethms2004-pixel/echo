/** Show a label in inbox/chat when MessageDoc omits legacy `text` (content lives on `message`). */
export function previewFromLastMessage(lastMessage: {
  text?: string;
  message?: { content?: unknown };
} | null): string {
  if (!lastMessage) {
    return "";
  }

  if (typeof lastMessage.text === "string" && lastMessage.text.trim().length > 0) {
    return lastMessage.text;
  }

  const content = lastMessage.message?.content;

  if (typeof content === "string") {
    const trimmed = content.trim();
    return trimmed.length > 0 ? trimmed : "";
  }

  if (Array.isArray(content)) {
    const first = content[0];
    if (
      first &&
      typeof first === "object" &&
      "text" in first &&
      typeof (first as { text: unknown }).text === "string"
    ) {
      const trimmed = (first as { text: string }).text.trim();
      return trimmed.length > 0 ? trimmed : "";
    }
  }

  return "";
}
