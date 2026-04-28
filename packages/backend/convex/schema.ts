import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    createdBy: v.string()
  }).index("by_created_by", ["createdBy"])
});
