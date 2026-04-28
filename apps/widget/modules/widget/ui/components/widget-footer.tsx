"use client";

import { useState } from "react";
import { HomeIcon, InboxIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export const WidgetFooter = () => {
  const [screen, setScreen] = useState<"selection" | "inbox">("selection");

  const handleSelectionClick = () => {
    setScreen("selection");
    // TODO: wire to chapter 12 state/router once screen management is centralized.
  };

  const handleInboxClick = () => {
    setScreen("inbox");
    // TODO: wire to chapter 12 state/router once screen management is centralized.
  };

  return (
    <footer className="flex items-center justify-between border-t bg-background">
      <Button
        className="h-14 flex-1 rounded-none"
        onClick={handleSelectionClick}
        size="icon"
        variant="ghost"
      >
        <HomeIcon
          className={cn("size-5", screen === "selection" && "text-primary")}
        />
      </Button>
      <Button
        className="h-14 flex-1 rounded-none"
        onClick={handleInboxClick}
        size="icon"
        variant="ghost"
      >
        <InboxIcon
          className={cn("size-5", screen === "inbox" && "text-primary")}
        />
      </Button>
    </footer>
  );
};
