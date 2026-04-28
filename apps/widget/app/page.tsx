"use client";

import { use } from "react";

import { WidgetView } from "@/modules/widget/ui/views/widget-view";

interface Props {
  searchParams: Promise<{
    organizationId: string;
  }>;
}

export default function Page(props: Props) {
  const { organizationId } = use(props.searchParams);

  return <WidgetView organizationId={organizationId} />;
}
