import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  inStock: defineTable({
    stockRemaining: v.number(),
    price: v.number(),
    link: v.string(),
    itemName: v.string(), // Added for display
    isDeleted: v.boolean(),
  }),

  submissions: defineTable({
    content: v.string(), // Costco link
    isDeleted: v.boolean(),
  }),

  users: defineTable({
    uin: v.string(), // Using string for flexibility
    balance: v.number(),
    isDeleted: v.boolean(),
  }).index("by_uin", ["uin"]),

  purchases: defineTable({
    productId: v.id("inStock"),
    userId: v.id("users"),
    timePurchased: v.string(), // ISO timestamp
    isDeleted: v.boolean(),
  }),

  requestedItems: defineTable({
    upvotes: v.number(),
    downvotes: v.number(),
    link: v.string(),
    itemName: v.string(), // Added for display
    isDeleted: v.boolean(),
  }),

  contributions: defineTable({
    userId: v.id("users"),
    itemName: v.string(),
    quantity: v.number(),
    pricePerUnit: v.number(),
    balanceAwarded: v.number(),
    timeContributed: v.string(), // ISO timestamp
    receipt: v.optional(v.string()), // Base64 encoded or URL for MVP
    isDeleted: v.boolean(),
  }),
});
