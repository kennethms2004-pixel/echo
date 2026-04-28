"use client";

import { createContext, useContext } from "react";

const WidgetOrganizationContext = createContext<string | null>(null);

export function WidgetOrganizationProvider({
  organizationId,
  children
}: {
  organizationId: string;
  children: React.ReactNode;
}) {
  return (
    <WidgetOrganizationContext.Provider value={organizationId}>
      {children}
    </WidgetOrganizationContext.Provider>
  );
}

export function useWidgetOrganizationId(): string {
  const id = useContext(WidgetOrganizationContext);
  if (!id) {
    throw new Error(
      "useWidgetOrganizationId must be used within WidgetOrganizationProvider"
    );
  }
  return id;
}
