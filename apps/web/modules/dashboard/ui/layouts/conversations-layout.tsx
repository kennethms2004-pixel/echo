"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@workspace/ui/components/resizable";

import { ConversationsPanel } from "@/modules/dashboard/ui/components/conversations-panel";

export const ConversationsLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
    <ResizablePanelGroup
      defaultLayout={[40, 60]}
      className="min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-hidden"
      id="conversations-split-v4"
      orientation="horizontal"
    >
      <ResizablePanel
        className="flex min-h-0 min-w-0 flex-col overflow-hidden"
        defaultSize={44}
        id="conversations-list-panel"
        minSize={12}
        style={{ overflow: "hidden" }}
      >
        <ConversationsPanel />
      </ResizablePanel>
      <ResizableHandle
        className="w-2.5 min-w-2.5 max-w-2.5 shrink-0 bg-border after:w-3"
        withHandle
      />
      <ResizablePanel
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        defaultSize={56}
        id="conversations-chat-panel"
        minSize={20}
        style={{ overflow: "hidden" }}
      >
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
    </div>
  );
};
