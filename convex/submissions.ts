import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("submissions", {
      content: args.content,
      isDeleted: false,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();
  },
});
