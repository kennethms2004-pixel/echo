import {
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
} from "lucide-react";

import type { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Hint } from "@workspace/ui/components/hint";

interface ConversationStatusButtonProps {
  disabled?: boolean;
  onClick: () => void;
  status: Doc<"conversations">["status"];
}

export const ConversationStatusButton = ({
  disabled,
  onClick,
  status,
}: ConversationStatusButtonProps) => {
  if (status === "resolved") {
    return (
      <Hint text="Mark as unresolved">
        <Button
          disabled={disabled}
          onClick={onClick}
          size="sm"
          type="button"
          variant="tertiary"
        >
          <CheckIcon />
          Resolved
        </Button>
      </Hint>
    );
  }

  if (status === "escalated") {
    return (
      <Hint text="Mark as resolved">
        <Button
          disabled={disabled}
          onClick={onClick}
          size="sm"
          type="button"
          variant="warning"
        >
          <ArrowUpIcon />
          Escalated
        </Button>
      </Hint>
    );
  }

  return (
    <Hint text="Mark as escalated">
      <Button
        disabled={disabled}
        onClick={onClick}
        size="sm"
        type="button"
        variant="destructive"
      >
        <ArrowRightIcon />
        Unresolved
      </Button>
    </Hint>
  );
};
