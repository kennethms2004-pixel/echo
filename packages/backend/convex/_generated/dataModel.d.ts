import type { GenericId } from "convex/values";

export type Id<TableName extends string> = GenericId<TableName>;

export type Doc<TableName extends string> = TableName extends "users"
  ? {
      _id: Id<"users">;
      _creationTime: number;
      name: string;
    }
  : never;
