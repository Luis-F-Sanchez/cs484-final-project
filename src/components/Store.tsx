// ============================================
// STORE COMPONENT
// ============================================
// This component displays the co-op store where users can:
// 1. Browse available inventory items
// 2. Select quantities for items they want to purchase
// 3. See total cost calculated in real-time
// 4. Complete purchases (which deducts from balance and inventory)
//
// The purchase process:
// - Validates user has sufficient balance
// - Checks inventory availability
// - Deducts balance and inventory
// - Records purchase history
// ============================================

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex.tsx";
import BarcodeScanner from "./BarcodeScanner";
import React from "react";

// Type definition: Selection tracks quantity selected for each item
// Key = item ID, Value = quantity selected
type Selection = Record<string, number>;

export default withConvexProvider(function Store({ token, isAdmin = false }: { token: string | null; isAdmin?: boolean }) {
  // Query: Fetch all inventory items from database (real-time updates)
  const items = useQuery(api.queries.inventory_getAll);

  // Mutation: Process a complete purchase transaction
  const processPurchase = useMutation(api.queries.processPurchase);

  // Mutation: allow admin to delete items from the store screen
  const deleteItem = useMutation(api.queries.inventory_delete);

  // State: Track which items and quantities user has selected
  const [selection, setSelection] = React.useState<Selection>({});

  // State: Display success/error messages to user
  const [status, setStatus] = React.useState<string | null>(null);

  // State: Manual barcode input and quantity
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [qtyInput, setQtyInput] = React.useState("1");

  // Loading state: Show message while data is being fetched
  if (items === undefined) {
    return <p className="py-4 text-center text-gray-500">Loading inventory...</p>;
  }

  // Filter out items with 0 quantity (out of stock items)
  const availableItems = items.filter((item) => item.quantity > 0);

  // Empty state: Show message if no items are in stock
  if (availableItems.length === 0) {
    return <p className="py-4 text-center text-gray-500">No items available.</p>;
  }

  // Helper function: Update quantity for a specific item
  // Ensures quantity stays within valid range (0 to max available)
  const setItemQty = (id: string, max: number, value: string) => {
    const n = Math.max(0, Math.min(max, parseInt(value || "0", 10)));
    setSelection((prev) => ({ ...prev, [id]: isNaN(n) ? 0 : n }));
  };

  // Calculate total number of items selected across all products
  const totalSelected = Object.values(selection).reduce((a, b) => a + (b || 0), 0);

  // Calculate total price based on selected quantities and item prices
  const totalPrice = availableItems.reduce((sum, item) => {
    const qty = selection[item._id] ?? 0;
    return sum + (qty * item.price);
  }, 0);

  // Handle purchase button click
  const handleBuySelected = async () => {

    if (!token) {
      setStatus("Please log in to purchase");
      return;
    }

    setStatus(null); // Clear previous status messages

    // Convert selection object to array format expected by mutation
    // Filter out items with 0 quantity (not selected)
    const itemsToBuy = Object.entries(selection)
      .filter(([_, qty]) => qty > 0)
      .map(([inventoryId, quantity]) => ({ inventoryId: inventoryId as any, quantity }));

    // Exit early if nothing selected
    if (itemsToBuy.length === 0) return;

    try {
      // Call the processPurchase mutation to complete the transaction
      // This will validate balance, update inventory, deduct balance, and record purchase
      await processPurchase({ token, items: itemsToBuy });

      // Show success message and clear selection
      setStatus(`Purchase successful! Spent $${totalPrice.toFixed(2)}`);
      setSelection({});
    } catch (err: any) {
      // Display error message (e.g., insufficient balance, out of stock)
      setStatus(err.message || "Purchase failed");
    }
  };

  // Handle barcode scan result (populate field)
  const handleScan = (code: string) => {
    setBarcodeInput(code);
    setStatus(`Scanned barcode: ${code}`);
  };

  // Handle manual add from barcode input
  const handleAddFromBarcode = () => {
    const code = barcodeInput.trim();
    const qtyToAdd = parseInt(qtyInput, 10);

    if (!code) {
      setStatus("Please enter or scan a barcode");
      return;
    }
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      setStatus("Please enter a valid quantity");
      return;
    }

    const item = availableItems.find(i => i.barcode === code);
    if (item) {
      const currentQty = selection[item._id] || 0;
      if (currentQty + qtyToAdd <= item.quantity) {
        setSelection(prev => ({ ...prev, [item._id]: currentQty + qtyToAdd }));
        setStatus(`Added ${qtyToAdd} x "${item.name}" to cart`);
        // Clear inputs after success
        setBarcodeInput("");
        setQtyInput("1");
      } else {
        setStatus(`Cannot add ${qtyToAdd} items. Only ${item.quantity - currentQty} more available.`);
      }
    } else {
      setStatus(`Item with barcode "${code}" not found`);
    }
  };

  // handle admin deleting items from the store screen
  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteItem({ token, id: id as any });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Delete failed");
    }
  }

  // Render the store UI
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <BarcodeScanner
              onResult={handleScan}
              label="Scan Barcode"
              buttonClassName="h-10 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer flex items-center justify-center whitespace-nowrap"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Barcode</label>
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan or enter barcode"
              className="w-full h-10 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="w-24">
            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
              min="1"
              className="w-full h-10 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddFromBarcode}
              className="h-10 px-6 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Grid of available items */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Map through each available item and display as a card */}
        {availableItems.map((item) => {
          const qty = selection[item._id] ?? 0; // Get selected quantity (0 if not selected)
          return (
            <div
              key={item._id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              {/* Item name */}
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>

              {/* Stock availability */}
              <p className="mt-1 text-sm text-gray-600">In stock: {item.quantity}</p>

              {/* Price per unit */}
              <p className="mt-2 text-xl font-bold text-blue-600">
                ${item.price.toFixed(2)}
              </p>

              {/* Quantity selector input */}
              <div className="mt-4 flex items-center gap-2">
                <label className="text-sm text-gray-700">Qty</label>
                <input
                  type="number"
                  min={0}
                  max={item.quantity}
                  value={qty}
                  onChange={(e) => setItemQty(item._id, item.quantity, e.target.value)}
                  className="w-20 rounded border px-2 py-1"
                />
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="rounded border px-2 py-1 text-s text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout section: Shows totals and purchase button */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-gray-700">
          {/* Display total items and price */}
          <p>Selected items: <span className="font-semibold">{totalSelected}</span></p>
          <p>Total price: <span className="font-semibold text-blue-600">${totalPrice.toFixed(2)}</span></p>
        </div>

        {/* Purchase button - disabled if nothing selected */}
        <button
          type="button"
          onClick={handleBuySelected}
          disabled={!token || totalSelected === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Buy Selected
        </button>
      </div>

      {/* Status message (success or error) */}
      {status && (
        <p className={`text-sm ${status.includes("successful") || status.includes("Added") || status.includes("Scanned") ? "text-green-600" : "text-red-600"}`}>
          {status}
        </p>
      )}
    </div>
  );
});