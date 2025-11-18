import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("inStock")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();
  },
});

export const create = mutation({
  args: {
    itemName: v.string(),
    stockRemaining: v.number(),
    price: v.number(),
    link: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inStock", {
      ...args,
      isDeleted: false,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("inStock") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { isDeleted: true });
  },
});
