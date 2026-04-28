import type { UserIdentity } from "convex/server";

/** Shown when the Clerk **convex** JWT lacks an org claim operators need. */
export const CLERK_CONVEX_JWT_ORG_MISSING =
  "No organization id in your Clerk token. Open Clerk Dashboard → JWT Templates → the **convex** template → add a claim such as \"organizationId\": \"{{org.id}}\" (Organizations must be enabled). Then sign out and sign back in.";

function readString(
  record: Record<string, unknown>,
  key: string
): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function orgIdFromOClaim(o: unknown): string | undefined {
  if (!o || typeof o !== "object") {
    return undefined;
  }
  const obj = o as Record<string, unknown>;
  const id = obj.id ?? obj.i;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}

/**
 * Active organization id from the Clerk-signed JWT Convex receives.
 *
 * Clerk session token v2 uses a compact `o` object; v1 used `org_id`. The Convex
 * JWT template may also define `organizationId` (recommended: add
 * `"organizationId": "{{org.id}}"` to the **convex** template in Clerk).
 */
export function clerkOrganizationId(identity: UserIdentity): string | undefined {
  const record = identity as Record<string, unknown>;

  return (
    readString(record, "organizationId") ??
    readString(record, "org_id") ??
    readString(record, "orgId") ??
    readString(record, "o.id") ??
    orgIdFromOClaim(record.o)
  );
}
