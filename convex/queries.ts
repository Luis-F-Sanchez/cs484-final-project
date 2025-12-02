import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


// ============================================
// HOW TO CREATE QUERIES AND MUTATIONS
// ============================================
//
// QUERIES: Read data from the database (cannot modify data)
// - Use `query()` function
// - Define input parameters in `args` using validators from `v`
// - Access database via `ctx.db`
// - Return data to the client
//
// MUTATIONS: Write/modify data in the database
// - Use `mutation()` function
// - Define input parameters in `args` using validators from `v`
// - Access database via `ctx.db`
// - Can insert, update (patch), or delete records
// - Return success/error information
//
// COMMON VALIDATORS:
// - v.string() - for text
// - v.number() - for numbers
// - v.id("tableName") - for database IDs
// - v.array() - for lists
// - v.object() - for nested structures
//
// COMMON DATABASE OPERATIONS:
// - ctx.db.query("tableName") - start a query
// - ctx.db.get(id) - get one record by ID
// - ctx.db.insert("tableName", data) - create new record
// - ctx.db.patch(id, updates) - update existing record
// - .filter(q => q.eq(q.field("fieldName"), value)) - filter results
// - .order("desc") - sort descending
// - .first() - get first result
// - .collect() - get all results
// ============================================


// Template
export const create = mutation({
  args: {
    author: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("comments", {
      author: args.author,
      content: args.content,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("comments").order("desc").collect();
  },
});

//Template ends

/* Inventory */
// QUERY: Get all inventory items, newest first
export const inventory_getAll = query({
  handler: async (ctx) => ctx.db.query("inventory").order("desc").collect(),
});

// MUTATION: Add a new item to inventory
export const inventory_addItem = mutation({
  args: { name: v.string(), quantity: v.number(), price: v.number() },
  handler: async (ctx, args) => ctx.db.insert("inventory", args),
});



// MUTATION: Decrease inventory quantity (e.g., after a sale)
export const inventory_decrement = mutation({
  args: { id: v.id("inventory"), amount: v.number() },
  handler: async (ctx, { id, amount }) => {
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Item not found");
    await ctx.db.patch(id, { quantity: Math.max(0, item.quantity - amount) });
  },
});

/* Users */
// QUERY: Find a user by their userId
export const users_getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) =>
    ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first(),
});

// MUTATION: Create or update a user's balance (upsert = update or insert)
export const users_upsert = mutation({
  args: { userId: v.string(), balance: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    return existing
      ? (await ctx.db.patch(existing._id, { balance: args.balance }), existing._id)
      : ctx.db.insert("users", args);
  },
});

// MUTATION: Add or subtract from a user's balance
export const users_adjustBalance = mutation({
  args: { userId: v.string(), delta: v.number() },
  handler: async (ctx, { userId, delta }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { balance: user.balance + delta });
  },
});

/* Purchases */
// QUERY: Get all purchases for a specific user, newest first
export const purchases_listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) =>
    ctx.db
      .query("purchases")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect(),
});



//That one is vibecode 100 but it works
// MUTATION: Process a complete purchase transaction
// This is a complex mutation that:
// 1. Validates user exists and has sufficient balance
// 2. Validates inventory availability
// 3. Deducts user balance
// 4. Decrements inventory
// 5. Records purchase history
export const processPurchase = mutation({
  args: {
    userId: v.string(),
    items: v.array(
      v.object({
        inventoryId: v.id("inventory"),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, { userId, items }) => {
    // 1. Get user
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (!user) throw new Error("User not found");

    // 2. Calculate total cost and validate inventory
    let totalCost = 0;
    const purchaseRecords = [];

    for (const { inventoryId, quantity } of items) {
      if (quantity <= 0) continue;

      const item = await ctx.db.get(inventoryId);
      if (!item) throw new Error(`Item ${inventoryId} not found`);
      if (item.quantity < quantity) {
        throw new Error(`Not enough stock for ${item.name}. Available: ${item.quantity}`);
      }

      const itemTotal = item.price * quantity;
      totalCost += itemTotal;

      purchaseRecords.push({
        inventoryId,
        itemName: item.name,
        quantity,
        unitPrice: item.price,
        totalCost: itemTotal,
      });
    }

    // 3. Check user balance
    if (user.balance < totalCost) {
      throw new Error(`Insufficient balance. Need $${totalCost.toFixed(2)}, have $${user.balance.toFixed(2)}`);
    }

    // 4. Execute all updates
    // Deduct balance
    await ctx.db.patch(user._id, { balance: user.balance - totalCost });

    // Decrement inventory and record purchases
    const timestamp = Date.now();
    for (const record of purchaseRecords) {
      const item = await ctx.db.get(record.inventoryId);
      if (item) {
        await ctx.db.patch(record.inventoryId, {
          quantity: item.quantity - record.quantity,
        });
      }

      await ctx.db.insert("purchases", {
        userId,
        inventoryId: record.inventoryId,
        itemName: record.itemName,
        quantity: record.quantity,
        unitPrice: record.unitPrice,
        totalCost: record.totalCost,
        timestamp,
      });
    }

    return { success: true, totalCost };
  },
});