"use client";

import type { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

export interface HintProps {
  align?: "center" | "end" | "start";
  children: ReactElement;
  side?: "bottom" | "left" | "right" | "top";
  text: string;
}

export const Hint = ({
  align = "center",
  children,
  side = "top",
  text,
}: HintProps) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent align={align} side={side}>
        {text}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
