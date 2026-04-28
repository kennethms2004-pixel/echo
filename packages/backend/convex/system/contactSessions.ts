import { v } from "convex/values";

import { internalQuery } from "../_generated/server";

export const getOne = internalQuery({
  args: {
    contactSessionId: v.id("contactSessions")
  },
  handler: (ctx, args) => {
    return ctx.db.get(args.contactSessionId);
  }
});
