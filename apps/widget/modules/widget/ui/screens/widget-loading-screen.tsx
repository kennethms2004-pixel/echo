"use client";

import { useAction, useMutation } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { api } from "@workspace/backend/_generated/api";

import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  screenAtom
} from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

const BACKEND_TIMEOUT_MS = 25_000;

interface Props {
  organizationId: string | null;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(
        new Error(
          `Request timed out after ${ms / 1000}s. Is Convex running and NEXT_PUBLIC_CONVEX_URL correct?`
        )
      );
    }, ms);
    promise
      .then((v) => {
        clearTimeout(id);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(id);
        reject(e);
      });
  });
}

export const WidgetLoadingScreen = ({ organizationId }: Props) => {
  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const validateOrganization = useAction(api.public.organizations.validate);
  const validateContactSession = useMutation(
    api.public.contactSessions.validate
  );

  // Refs so the init effect can read the latest values without re-running.
  const contactSessionIdRef = useRef(contactSessionId);
  contactSessionIdRef.current = contactSessionId;
  const validateOrganizationRef = useRef(validateOrganization);
  validateOrganizationRef.current = validateOrganization;
  const validateContactSessionRef = useRef(validateContactSession);
  validateContactSessionRef.current = validateContactSession;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoadingMessage("Connecting to backend…");

      if (!organizationId) {
        if (cancelled) return;
        setErrorMessage("Organization ID is required");
        setScreen("error");
        return;
      }

      // 1. Validate organization with Clerk (via Convex action).
      try {
        setLoadingMessage("Verifying organization with Clerk…");
        const result = await withTimeout(
          validateOrganizationRef.current({ organizationId }),
          BACKEND_TIMEOUT_MS
        );
        if (cancelled) return;
        if (!result.valid) {
          setErrorMessage(result.reason || "Invalid configuration");
          setScreen("error");
          return;
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[widget] validateOrganization failed", err);
        setErrorMessage(
          err instanceof Error ? err.message : "Unable to verify organization"
        );
        setScreen("error");
        return;
      }

      // 2. If a contact session is cached for this org, validate it.
      const cachedSessionId = contactSessionIdRef.current;
      if (!cachedSessionId) {
        if (cancelled) return;
        setScreen("auth");
        return;
      }

      try {
        setLoadingMessage("Validating session…");
        const result = await withTimeout(
          validateContactSessionRef.current({ contactSessionId: cachedSessionId }),
          BACKEND_TIMEOUT_MS
        );
        if (cancelled) return;
        setScreen(result.valid ? "selection" : "auth");
      } catch (err) {
        if (cancelled) return;
        console.error("[widget] validateContactSession failed", err);
        setScreen("auth");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
    // Intentionally only re-run when organizationId changes — refs cover the
    // mutable convex hooks so we don't restart init on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there 👋</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || "Loading..."}</p>
      </div>
    </>
  );
};
