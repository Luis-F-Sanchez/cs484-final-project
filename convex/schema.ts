import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


// ============================================
// HOW TO CREATE DATABASE TABLES IN SCHEMA
// ============================================
//
// WHAT IS A SCHEMA?
// - Defines the structure of your database
// - Lists all tables and their fields
// - Specifies data types for each field
//
// HOW TO ADD A NEW TABLE:
// 1. Inside defineSchema(), add a new property with your table name
// 2. Use defineTable() to define the table structure
// 3. List all fields inside an object passed to defineTable()
// 4. Each field uses a validator from `v` to specify its type
//
// EXAMPLE:
// tableName: defineTable({
//   fieldName1: v.string(),
//   fieldName2: v.number(),
//   fieldName3: v.boolean(),
// }),
//
// COMMON FIELD TYPES:
// - v.string() - text data (names, descriptions, IDs)
// - v.number() - numeric data (prices, quantities, timestamps)
// - v.boolean() - true/false values
// - v.id("tableName") - reference to another table's ID
// - v.array(v.string()) - list of items
// - v.object({ ... }) - nested structure with multiple fields
// - v.optional(v.string()) - field that may or may not be present
//
// IMPORTANT NOTES:
// - Every table automatically gets an _id field (you don't define it)
// - Every table automatically gets a _creationTime field
// - Table names should be lowercase and plural (e.g., "users", "products")
// - Field names should be camelCase (e.g., "firstName", "totalCost")
// ============================================


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
    inventoryId: v.id("inventory"), // Reference to the inventory item
    itemName: v.string(), // denormalized for easy display
    quantity: v.number(),
    unitPrice: v.number(),
    totalCost: v.number(),
    timestamp: v.number(), // Date.now()
  })
});
