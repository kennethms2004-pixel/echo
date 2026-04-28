"use client";

import { Suspense, useEffect, useMemo, useState } from "react";

import { useSearchParams } from "next/navigation";

import {
  organizationIdFromLocation,
  organizationIdFromSearchParams
} from "@/modules/widget/lib/organization-id-from-url";
import { WidgetView } from "@/modules/widget/ui/views/widget-view";

function WidgetPageInner() {
  const searchParams = useSearchParams();
  const [locationTick, setLocationTick] = useState(0);

  useEffect(() => {
    const bump = () => setLocationTick((n) => n + 1);
    bump();
    window.addEventListener("hashchange", bump);
    window.addEventListener("popstate", bump);
    return () => {
      window.removeEventListener("hashchange", bump);
      window.removeEventListener("popstate", bump);
    };
  }, []);

  const organizationId = useMemo(() => {
    const fromNext = organizationIdFromSearchParams(searchParams);
    if (fromNext) {
      return fromNext;
    }
    if (typeof window !== "undefined") {
      return organizationIdFromLocation(window.location);
    }
    return "";
  }, [searchParams, locationTick]);

  if (!organizationId) {
    return (
      <main className="flex min-h-screen flex-col justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold">Widget needs an organization</h1>
        <p className="text-muted-foreground text-sm">
          Add a query param such as{" "}
          <code className="text-foreground">organizationId</code> (also supported:{" "}
          <code className="text-foreground">orgId</code>,{" "}
          <code className="text-foreground">organization_id</code>
          ). Example:
        </p>
        <code className="bg-muted text-foreground block rounded-md border p-3 text-sm break-all">
          /?organizationId=org_xxxxxxxx
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
