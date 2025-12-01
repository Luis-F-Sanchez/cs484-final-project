import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  comments: defineTable({
    author: v.string(),
    content: v.string(),
  }),
  inventory: defineTable({
    name: v.string(),
    quantity: v.number(),
    price: v.number(),
  }),

  users: defineTable({
    userId: v.string(), // provider tokenIdentifier or app-specific ID
    balance: v.number(),
  }),

  purchases: defineTable({
    userId: v.string(),
    inventoryId: v.id("inventory"),
    itemName: v.string(), // denormalized for easy display
    quantity: v.number(),
    unitPrice: v.number(),
    totalCost: v.number(),
    timestamp: v.number(), // Date.now()
  })
});
