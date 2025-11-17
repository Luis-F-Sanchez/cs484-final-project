import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreate = mutation({
  args: {
    uin: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_uin", (q) => q.eq("uin", args.uin))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      uin: args.uin,
      balance: 0,
      isDeleted: false,
    });
  },
});

export const getBalance = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.balance ?? 0;
  },
});
