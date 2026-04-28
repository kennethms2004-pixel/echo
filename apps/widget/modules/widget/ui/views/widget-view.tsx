"use client";

import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";

interface Props {
  organizationId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const WidgetView = ({ organizationId }: Props) => {
  return (
    <main className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetAuthScreen />
    </main>
  );
};
