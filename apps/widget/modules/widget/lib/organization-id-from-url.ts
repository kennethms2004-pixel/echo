const ORG_QUERY_KEYS = [
  "organizationId",
  "orgId",
  "organization_id",
  "org_id"
] as const;

function firstNonEmpty(
  params: URLSearchParams,
  keys: readonly string[]
): string {
  for (const key of keys) {
    const value = params.get(key)?.trim();
    if (value) {
      return value;
    }
  }
  return "";
}

/** Next.js `useSearchParams()` */
export function organizationIdFromSearchParams(
  searchParams: URLSearchParams
): string {
  return firstNonEmpty(searchParams, ORG_QUERY_KEYS);
}

/**
 * Read the same keys from `window.location` (search + hash).
 * Covers cases where `useSearchParams()` is empty but the URL still carries
 * the org (iframes, client-only navigations, or `?…` embedded in the hash).
 */
export function organizationIdFromLocation(
  location: Pick<Location, "search" | "hash">
): string {
  const fromSearch = firstNonEmpty(
    new URLSearchParams(location.search),
    ORG_QUERY_KEYS
  );
  if (fromSearch) {
    return fromSearch;
  }

  const raw = location.hash.replace(/^#/, "");
  if (!raw || !raw.includes("=")) {
    return "";
  }

  const tryParse = (segment: string) =>
    firstNonEmpty(
      new URLSearchParams(segment.replace(/^\?/, "")),
      ORG_QUERY_KEYS
    );

  if (raw.includes("?")) {
    const q = raw.split("?").pop() ?? "";
    const fromSplit = tryParse(q);
    if (fromSplit) {
      return fromSplit;
    }
  }

  return tryParse(raw);
}
