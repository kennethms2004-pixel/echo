import type { FunctionReference } from "convex/server";

export declare const api: {
  users: {
    getMany: FunctionReference<"query", "public", Record<string, never>, Array<{ _id: string; _creationTime: number; name: string }>>;
    add: FunctionReference<"mutation", "public", Record<string, never>, string>;
  };
};
