import type { ComponentProps, HTMLAttributes } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
};

export const AIMessage = ({ className, from, ...props }: AIMessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end gap-2.5 py-1.5 sm:py-2",
      from === "user"
        ? "is-user justify-end"
        : "is-assistant flex-row-reverse justify-end",
      "[&>div:first-of-type]:max-w-[min(92%,32rem)]",
      className
    )}
    {...props}
  />
);

export type AIMessageContentProps = HTMLAttributes<HTMLDivElement>;

export const AIMessageContent = ({
  children,
  className,
  ...props
}: AIMessageContentProps) => (
  <div
    className={cn(
      "break-words",
      "flex flex-col gap-2 rounded-lg border border-border px-3 py-2 text-sm",
      "bg-background text-foreground",
      "group-[.is-user]:border-transparent group-[.is-user]:bg-gradient-to-b group-[.is-user]:from-primary group-[.is-user]:to-[#0b63f3] group-[.is-user]:text-primary-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const AIMessageAvatar = ({
  src,
  name,
  className,
  ...props
}: AIMessageAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);
