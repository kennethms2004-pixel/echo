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
    return content;
  }

  if (Array.isArray(content)) {
    const first = content[0];
    if (
      first &&
      typeof first === "object" &&
      "text" in first &&
      typeof (first as { text: unknown }).text === "string"
    ) {
      return (first as { text: string }).text;
    }
  }

  return "";
}
