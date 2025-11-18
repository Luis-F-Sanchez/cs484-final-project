import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    itemName: v.string(),
    quantity: v.number(),
    pricePerUnit: v.number(),
    balanceAwarded: v.number(),
  },
  handler: async (ctx, args) => {
    const contributionId = await ctx.db.insert("contributions", {
      ...args,
      timeContributed: new Date().toISOString(),
      isDeleted: false,
    });

    await ctx.db.insert("inStock", {
      itemName: args.itemName,
      stockRemaining: args.quantity,
      price: args.pricePerUnit,
      link: "",
      isDeleted: false,
    });

    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        balance: user.balance + args.balanceAwarded,
      });
    }

    return contributionId;
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("contributions")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .collect();
  },
});
