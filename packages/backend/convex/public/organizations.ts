import { createClerkClient } from "@clerk/backend";
import { v } from "convex/values";

import { action } from "../_generated/server";

export const validate = action({
  args: {
    organizationId: v.string()
  },
  handler: async (_, args) => {
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "[organizations.validate] CLERK_SECRET_KEY is not set on Convex. Run: npx convex env set CLERK_SECRET_KEY <your_clerk_secret>"
      );
      return { valid: false, reason: "Invalid organization" };
    }

    const clerkClient = createClerkClient({
      secretKey
    });

    try {
      await clerkClient.organizations.getOrganization({
        organizationId: args.organizationId
      });

      return { valid: true };
    } catch (error: unknown) {
      const status =
        error &&
        typeof error === "object" &&
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
          ? (error as { status: number }).status
          : undefined;

      if (status === 404) {
        return { valid: false, reason: "Invalid organization" };
      }

      console.error("[organizations.validate] unexpected failure", {
        status,
        error
      });
      return { valid: false, reason: "Invalid organization" };
    }
  }
});
