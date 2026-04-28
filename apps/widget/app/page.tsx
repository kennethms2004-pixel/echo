"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";

import { WidgetView } from "@/modules/widget/ui/views/widget-view";

function WidgetPageInner() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return (
      <main className="flex min-h-screen flex-col justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold">Widget needs an organization</h1>
        <p className="text-muted-foreground text-sm">
          Open the Clerk dashboard →{" "}
          <strong>Organizations</strong> → copy an organization ID, then visit:
        </p>
        <code className="bg-muted text-foreground block rounded-md border p-3 text-sm">
          http://localhost:3001?organizationId=org_xxxxxxxx
        </code>
      </main>
    );
  }

  return <WidgetView key={organizationId} organizationId={organizationId} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="text-muted-foreground flex min-h-screen items-center justify-center">
          <p className="text-sm">Loading widget…</p>
        </main>
      }
    >
      <WidgetPageInner />
    </Suspense>
  );
}
