import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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
// QUERY: returns all rows from the inventory table, newest first
export const inventory_getAll = query({
  handler: async (ctx) => ctx.db.query("inventory").order("desc").collect(),
});

// MUTATION: inserts a new inventory item with name, quantity, and price
export const inventory_addItem = mutation({
  args: { name: v.string(), quantity: v.number(), price: v.number() },
  handler: async (ctx, args) => ctx.db.insert("inventory", args),
});

// MUTATION: subtracts amount from an inventory item's quantity
export const inventory_decrement = mutation({
  args: { id: v.id("inventory"), amount: v.number() },
  handler: async (ctx, { id, amount }) => {
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Item not found");
    await ctx.db.patch(id, { quantity: Math.max(0, item.quantity - amount) });
  },
});
/* Inventory Ends */

/* Users */
// QUERY: given a token, resolves the session and returns the user's userId, username, and balance
export const users_me = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const { user } = await requireSession(ctx, token);
    return { userId: user.userId, username: user.username, balance: user.balance, isAdmin: user.isAdmin};
  },
});

// MUTATION: given a token and balance, sets that user's balance
export const users_upsert = mutation({
  args: { token: v.string(), balance: v.number() },
  handler: async (ctx, { token, balance }) => {
    const { user } = await requireSession(ctx, token);
    await ctx.db.patch(user._id, { balance });
    return user._id;
  },
});

// MUTATION: given a token and delta, adds delta to the curr. user's balance
export const users_adjustBalance = mutation({
  args: { token: v.string(), delta: v.number() },
  handler: async (ctx, { token, delta }) => {
    const { user } = await requireSession(ctx, token);
    await ctx.db.patch(user._id, { balance: user.balance + delta });
  },
});
/* Users Ends */

/* Purchases */
// QUERY: given a token, resolves the user and returns all purchase records for that userId, newest first
export const purchases_listByUser = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const { user } = await requireSession(ctx, token);
    return ctx.db
      .query("purchases")
      .filter(q => q.eq(q.field("userId"), user.userId))
      .order("desc")
      .collect();
  },
});

// MUTATION: given a token and an array of {inventoryId, quantity}, this resolves the user,
// validates stock and balance, calculates totals, deducts balances, decrements inventory,
// and inserts purchase records
export const processPurchase = mutation({
  args: {
    token: v.string(),
    items: v.array(
      v.object({
        inventoryId: v.id("inventory"),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, { token, items }) => {
    // 1. Get user from session
    const { user } = await requireSession(ctx, token);
    const userId = user.userId;

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

// MUTATION: given a username, if the user exists, create a session for them; else create a new user
// with that username and a balance of 0, then create the session. Returns {token}
export const auth_register = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const existing = await ctx.db.query("users").filter(q => q.eq(q.field("username"), username)).first();
    if (existing) return { token: await createSession(ctx, existing._id) };
    const userId = await ctx.db.insert("users", { userId: username, username, balance: 0, isAdmin: false, });
    return { token: await createSession(ctx, userId) };
  },
});

// MUTATION: given a username, find the user; if missing, throw an error, else create a session and return {token}
export const auth_login = mutation({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db.query("users").filter(q => q.eq(q.field("username"), username)).first();
    if (!user) throw new Error("No such user");
    return { token: await createSession(ctx, user._id)};
  },
})

// HELPER FUNCTION: creates a pseudo-random token with a 1 week expiration and inserts it into the sessions table
async function createSession(ctx: MutationCtx, userId: Id<"users">) {
  const token = generateToken();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  await ctx.db.insert("sessions", { userId, token, expiresAt });
  return token;
}

// HELPER FUNCTION: looks up a session by token, checks expiration, fetches the user, and throws unauthorized if invalid. Returns {user}
async function requireSession(ctx: QueryCtx | MutationCtx, token: string) {
  const session = await ctx.db.query("sessions").filter(q => q.eq(q.field("token"), token)).first();
  if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
  const user = await ctx.db.get(session.userId);
  if (!user) throw new Error("Unauthorized");
  return { user };
}

// HELPER FUNCTION: builds a simple random string for demo tokens
function generateToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

// QUERY: given a token, returns the current user's userId, username, and balance, or null if the session is invalid
export const auth_me = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    try {
      const { user } = await requireSession(ctx, token);
      return { userId: user.userId, username: user.username, balance: user.balance };
    } catch {
      return null;
    }
  },
});

// HELPER FUNCTION: resolves session and enforces admin access
async function requireAdmin(ctx: QueryCtx | MutationCtx, token: string) {
  const { user } = await requireSession(ctx, token);
  if (!user.isAdmin) throw new Error("Forbidden");
  return { user };
}

// MUTATION: user submits a contribution for admin review (does not hit inventory yet)
export const pending_submit = mutation({
  args: { token: v.string(), name: v.string(), quantity: v.number(), price: v.number() },
  handler: async (ctx, { token, name, quantity, price }) => {
    const { user } = await requireSession(ctx, token);
    return ctx.db.insert("pending_contributions", {
      userId: user.userId,
      name: name.trim(),
      quantity,
      price,
      submittedAt: Date.now(),
    });
  },
})

// QUERY: admin only, returns all pending contributions (newest at the top)
export const pending_list = query({
  args: {token: v.string() },
  handler: async (convexToJson, { token }) => {
    await requireAdmin(convexToJson, token);
    return convexToJson.db.query("pending_contributions").order("desc").collect();
  },
});

// MUTATION: admin only, approves a pending contribution by adding inventory, crediting the contributor, and deleting the pending entry
export const pending_approve = mutation({
  args: { token: v.string(), pendingId: v.id("pending_contributions") },
  handler: async (ctx, { token, pendingId }) => {
    await requireAdmin(ctx, token);

    const pending = await ctx.db.get(pendingId);
    if (!pending) throw new Error("Pending item not found");

    // add the item to inventory upon approval
    await ctx.db.insert("inventory", {
      name: pending.name,
      quantity: pending.quantity,
      price: pending.price,
    });

    // credit the contributor's balance upon approval
    const user = await ctx.db.query("users").filter(q => q.eq(q.field("userId"), pending.userId)).first();
    if (user) {
      const delta = pending.quantity * pending.price;
      await ctx.db.patch(user._id, { balance: user.balance + delta});
    }

    // remove the contribution request from pending
    await ctx.db.delete(pendingId);
    return { ok: true};
  }
});

// MUTATION: admin only, denies a pending contribution by deleting the pending entry (no inventory change)
export const pending_deny = mutation({
  args: { token: v.string(), pendingId: v.id("pending_contributions") },
  handler: async (convexToJson, { token, pendingId }) => {
    await requireAdmin(convexToJson, token);
    await convexToJson.db.delete(pendingId);
    return { ok: true} ;
  }
})

// MUTATION: admin only, allows admin to straight up delete items from the food coop
export const inventory_delete = mutation({
  args: { token: v.string(), id: v.id("inventory") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    await ctx.db.delete(id);
    return { ok: true };
  },
})