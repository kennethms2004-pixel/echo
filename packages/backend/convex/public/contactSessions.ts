import { v } from "convex/values";

import { mutation } from "../_generated/server";

export const validate = mutation({
  args: {
    contactSessionId: v.id("contactSessions")
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession) {
      return { valid: false, reason: "Contact session not found" };
    }

    if (contactSession.expiresAt < Date.now()) {
      return { valid: false, reason: "Contact session expired" };
    }

    return { valid: true, contactSession };
  }
});

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        languages: v.optional(v.array(v.string())),
        platform: v.optional(v.string()),
        vendor: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        viewportSize: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
        cookieEnabled: v.optional(v.boolean()),
        referrerDomain: v.optional(v.string()),
        currentPath: v.optional(v.string())
      })
    )
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const email = args.email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      throw new Error("Invalid email address.");
    }

    const existingSession = await ctx.db
      .query("contactSessions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), email),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .first();

    if (existingSession) {
      return existingSession._id;
    }

    const recentWindowStart = now - RATE_LIMIT_WINDOW_MS;
    const requesterFingerprint = [
      args.metadata?.userAgent ?? "unknown",
      args.metadata?.language ?? "unknown",
      args.metadata?.timezone ?? "unknown"
    ].join("|");

    // Single mutation: Convex runs this handler atomically (read + insert are one transaction).
    const recentSessions = await ctx.db
      .query("contactSessions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.gt(q.field("_creationTime"), recentWindowStart))
      .collect();

    const recentSessionCountForRequester = recentSessions.filter((session) => {
      const sessionFingerprint = [
        session.metadata?.userAgent ?? "unknown",
        session.metadata?.language ?? "unknown",
        session.metadata?.timezone ?? "unknown"
      ].join("|");

      return sessionFingerprint === requesterFingerprint;
    }).length;

    if (recentSessionCountForRequester >= MAX_REQUESTS_PER_WINDOW) {
      throw new Error("Too many session attempts. Please try again later.");
    }

    const expiresAt = now + SESSION_DURATION_MS;

    const contactSessionId = await ctx.db.insert("contactSessions", {
      name: args.name,
      email,
      organizationId: args.organizationId,
      expiresAt,
      metadata: args.metadata
    });

    return contactSessionId;
  }
});
