"use client";

import { useAction, useMutation } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";

import { api } from "@workspace/backend/_generated/api";

import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  screenAtom
} from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

type InitStep = "organization" | "session" | "done";

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
  const [step, setStep] = useState<InitStep>("organization");
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    setStep("organization");
    setSessionValid(false);
  }, [organizationId]);

  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  // Step 1: Validate organization
  const validateOrganization = useAction(api.public.organizations.validate);

  useLayoutEffect(() => {
    setLoadingMessage("Connecting to backend…");
  }, [setLoadingMessage]);

  useEffect(() => {
    if (step !== "organization") {
      return;
    }

    setLoadingMessage("Finding organization ID…");

    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error");
      return;
    }

    setLoadingMessage("Verifying organization with Clerk…");

    void withTimeout(
      validateOrganization({ organizationId }),
      BACKEND_TIMEOUT_MS
    )
      .then((result) => {
        if (result.valid) {
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Invalid configuration");
          setScreen("error");
        }
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Unable to verify organization";
        setErrorMessage(message);
        setScreen("error");
      });
  }, [
    step,
    organizationId,
    setErrorMessage,
    setScreen,
    setLoadingMessage,
    validateOrganization
  ]);

  // Step 2: Validate session if it exists
  const validateContactSession = useMutation(
    api.public.contactSessions.validate
  );

  useEffect(() => {
    if (step !== "session") {
      return;
    }

    setLoadingMessage("Finding contact session…");

    if (!contactSessionId) {
      setSessionValid(false);
      setStep("done");
      return;
    }

    setLoadingMessage("Validating session…");

    void withTimeout(
      validateContactSession({ contactSessionId }),
      BACKEND_TIMEOUT_MS
    )
      .then((result) => {
        setSessionValid(result.valid);
        setStep("done");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("done");
      });
  }, [step, contactSessionId, validateContactSession, setLoadingMessage]);

  // Final step: Route to next screen
  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid, setScreen]);

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
