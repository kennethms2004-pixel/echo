import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const USERS_LIMIT = 50;

export const getMany = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(USERS_LIMIT);

    return users;
  }
});

export const add = mutation({
  args: {
    name: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Unauthorized");
    }

    const orgId = identity.org_id as string;

    if (!orgId) {
      throw new Error("Missing organization");
    }

    if (orgId) {
      throw new Error("Tracking test");
    }

    const { name } = args;
    const createdBy = identity.subject ?? identity.tokenIdentifier;

    if (!createdBy) {
      throw new Error("Unable to determine authenticated user id.");
    }

    const userId = await ctx.db.insert("users", {
      name,
      createdBy
    });

    return userId;
  }
});
