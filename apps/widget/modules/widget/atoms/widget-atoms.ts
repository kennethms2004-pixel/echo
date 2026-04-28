import { atom } from "jotai";
import { atomFamily, atomWithStorage, createJSONStorage } from "jotai/utils";

import type { Id } from "@workspace/backend/_generated/dataModel";

import { CONTACT_SESSION_KEY } from "@/modules/widget/constants";
import type { WidgetScreen } from "@/modules/widget/types";

// Basic widget state atoms
export const screenAtom = atom<WidgetScreen>("loading");

export const errorMessageAtom = atom<string | null>(null);
export const loadingMessageAtom = atom<string | null>(null);

export const conversationIdAtom = atom<Id<"conversations"> | null>(null);

const contactSessionJSONStorage = createJSONStorage<
  Id<"contactSessions"> | null
>(() =>
  typeof window !== "undefined"
    ? localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      }
);

// Organization-scoped contact session atom (no shared localStorage key when org id is missing)
export const contactSessionIdAtomFamily = atomFamily((organizationId: string) =>
  organizationId
    ? atomWithStorage<Id<"contactSessions"> | null>(
        `${CONTACT_SESSION_KEY}_${organizationId}`,
        null,
        contactSessionJSONStorage,
        { getOnInit: true }
      )
    : atom<Id<"contactSessions"> | null>(null)
);
