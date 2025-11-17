import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("requestedItems")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();
  },
});

export const create = mutation({
  args: {
    itemName: v.string(),
    link: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("requestedItems", {
      ...args,
      upvotes: 0,
      downvotes: 0,
      isDeleted: false,
    });
  },
});

export const vote = mutation({
  args: {
    id: v.id("requestedItems"),
    isUpvote: v.boolean(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return;

    if (args.isUpvote) {
      await ctx.db.patch(args.id, { upvotes: item.upvotes + 1 });
    } else {
      await ctx.db.patch(args.id, { downvotes: item.downvotes + 1 });
    }
  },
});
