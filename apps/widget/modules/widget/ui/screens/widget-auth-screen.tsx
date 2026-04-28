"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "@workspace/backend/_generated/api";
import type { Doc } from "@workspace/backend/_generated/dataModel";

import {
  contactSessionIdAtomFamily,
  screenAtom
} from "@/modules/widget/atoms/widget-atoms";
import { useWidgetOrganizationId } from "@/modules/widget/context/widget-organization-context";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";

import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address")
});

type FormValues = z.infer<typeof formSchema>;

export const WidgetAuthScreen = () => {
  const organizationId = useWidgetOrganizationId();
  const setContactSessionId = useSetAtom(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const setScreen = useSetAtom(screenAtom);

  const createContactSession = useMutation(
    api.public.contactSessions.create
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!organizationId) {
      setSubmitError("Missing organization context. Please reload the widget.");
      return;
    }

    setSubmitError(null);

    const referrerDomain = (() => {
      if (!document.referrer) {
        return undefined;
      }

      try {
        return new URL(document.referrer).hostname;
      } catch {
        return undefined;
      }
    })();

    const metadata: Doc<"contactSessions">["metadata"] = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: Array.from(navigator.languages ?? []),
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      cookieEnabled: navigator.cookieEnabled,
      referrerDomain,
      currentPath: window.location.pathname
    };

    try {
      const contactSessionId = await createContactSession({
        ...values,
        metadata,
        organizationId
      });

      setContactSessionId(contactSessionId);
      setScreen("selection");
    } catch (error) {
      console.error("Failed to create contact session", error);
      setSubmitError(
        "We couldn't start your session. Please try again in a moment."
      );
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there 👋</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-y-4 p-4"
        >
          <FormField<FormValues>
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-10 bg-background"
                    placeholder="John Doe"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-10 bg-background"
                    placeholder="john.doe@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={form.formState.isSubmitting} size="lg" type="submit">
            Continue
          </Button>
          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}
        </form>
      </Form>
    </>
  );
};
