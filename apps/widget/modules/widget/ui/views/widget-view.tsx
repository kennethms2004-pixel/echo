"use client";

import { useLayoutEffect, useRef } from "react";

import { useAtomValue, useSetAtom } from "jotai";

import { WidgetOrganizationProvider } from "@/modules/widget/context/widget-organization-context";
import { errorMessageAtom, screenAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";
import { WidgetChatScreen } from "@/modules/widget/ui/screens/widget-chat-screen";
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen";
import { WidgetInboxScreen } from "@/modules/widget/ui/screens/widget-inbox-screen";
import { WidgetLoadingScreen } from "@/modules/widget/ui/screens/widget-loading-screen";
import { WidgetSelectionScreen } from "@/modules/widget/ui/screens/widget-selection-screen";

interface Props {
  organizationId: string;
}

export const WidgetView = ({ organizationId }: Props) => {
  const screen = useAtomValue(screenAtom);
  const setScreen = useSetAtom(screenAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const previousOrganizationIdRef = useRef(organizationId);

  useLayoutEffect(() => {
    if (previousOrganizationIdRef.current === organizationId) {
      return;
    }

    previousOrganizationIdRef.current = organizationId;
    setScreen("loading");
    // Do not clear loadingMessageAtom here — WidgetLoadingScreen sets it in a
    // child useLayoutEffect; clearing it in the parent was wiping "Connecting…"
    // and left only the fallback "Loading..." forever.
    setErrorMessage(null);
  }, [organizationId, setScreen, setErrorMessage]);

  const screenComponents = {
    loading: (
      <WidgetLoadingScreen
        key={`init-${organizationId}`}
        organizationId={organizationId}
      />
    ),
    error: <WidgetErrorScreen />,
    selection: <WidgetSelectionScreen />,
    voice: <WidgetSelectionScreen />,
    auth: <WidgetAuthScreen />,
    inbox: <WidgetInboxScreen />,
    chat: <WidgetChatScreen />,
    contact: <WidgetSelectionScreen />,
  };

  return (
    <WidgetOrganizationProvider organizationId={organizationId}>
      <main className="flex min-h-[100dvh] w-full flex-col overflow-hidden rounded-xl border bg-muted">
        {screenComponents[screen]}
      </main>
    </WidgetOrganizationProvider>
  );
};
