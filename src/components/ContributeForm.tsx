// ============================================
// CONTRIBUTE FORM COMPONENT
// ============================================
// This component allows users to contribute items to the food co-op inventory.
// When a user contributes an item, they:
// 1. Add the item to the shared inventory
// 2. Get credited to their balance (amount = quantity × unit price)
//
// EXAMPLE: If you contribute 10 apples at $1.25 each:
// - 10 apples get added to inventory
// - Your balance increases by $12.50
// ============================================

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import BarcodeScanner from "./BarcodeScanner";
import { withConvexProvider } from "../lib/convex.tsx";
import { useEffect } from "react";

export default withConvexProvider(function ContributeForm({ token }: { token: string | null }) {
  const submitPending = useMutation(api.queries.pending_submit);
  const restockItem = useMutation(api.queries.inventory_restock);

  // Form state - tracks user input
  const [name, setName] = useState("");           // Item name (e.g., "Apples")
  const [barcode, setBarcode] = useState("");     // Scanned barcode or manual entry
  const [quantity, setQuantity] = useState("");   // How many units
  const [unitPrice, setUnitPrice] = useState(""); // Price per unit
  const [status, setStatus] = useState<string | null>(null); // Success/error messages

  // Query existing item by barcode
  const existingItem = useQuery(api.queries.inventory_getByBarcode, { barcode: barcode.trim() });

  // Auto-fill name and price if barcode matches existing item
  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name);
      setUnitPrice(existingItem.price.toString());
    } else if (barcode.trim()) {
      // If typing a new barcode, keep fields editable
    }
  }, [existingItem, barcode]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {

    if (!token) {
      setStatus("Please log in to contribute.");
      return;
    }

    e.preventDefault(); // Prevent page reload
    setStatus(null);    // Clear previous status message

    // Convert string inputs to numbers
    const qtyNum = parseInt(quantity, 10);
    const priceNum = parseFloat(unitPrice);

    // Validation: Check all inputs are valid
    if (!name.trim()) return setStatus("Item name is required.");
    if (isNaN(qtyNum) || qtyNum <= 0) return setStatus("Quantity must be a positive integer.");
    if (isNaN(priceNum) || priceNum <= 0) return setStatus("Unit price must be a positive number.");

    // Calculate total value of contribution
    const totalSpent = qtyNum * priceNum;

    try {
      if (existingItem) {
        // DIRECT RESTOCK
        await restockItem({ token, barcode: barcode.trim(), quantity: qtyNum, price: priceNum });
        setStatus(`Restocked "${name}" (Quantity: +${qtyNum})`);
      } else {
        // NEW SUBMISSION (PENDING)
        await submitPending({ token, name: name.trim(), quantity: qtyNum, price: priceNum, barcode: barcode.trim() || undefined });
        setStatus(`Submitted "${name}" for approval`);
      }

      // Reset form
      if (!existingItem) setName(""); // Only clear name if it wasn't locked
      setQuantity("");
      setUnitPrice("");
      // Keep barcode? Or clear it? User workflow implies single scan. Let's clear logic to be safe.
      setBarcode("");
      setName(""); // Clear name anyway for fresh state
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit item contribution request. Please try again";
      if (msg.toLowerCase().includes("unauthorized")) {
        setStatus("Session expired or invalid. Please log in again on the Auth page.");
      } else {
        setStatus(msg);
      }
    }

  };

  // Render the form UI
  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Submit Contribution Request</h2>

      {/* Item Name Input */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {existingItem ? "Item Name (Automatically deduced from barcode)" : "Item Name"}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Apples"
          className={`w-full rounded border px-3 py-2 ${existingItem ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
          disabled={!!existingItem}
        />
      </div>

      {/* Barcode Input & Scanner */}
      <div>
        <label className="block text-sm font-medium mb-1">Barcode (Optional)</label>
        <div className="space-y-2">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan or type barcode"
            className="w-full rounded border px-3 py-2"
          />
          <BarcodeScanner onResult={(result) => setBarcode(result)} />
        </div>
      </div>



      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min={1}
          step={1}
          placeholder="e.g., 10"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {/* Unit Price Input */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {existingItem ? "Unit Price ($) (Automatically deduced from barcode)" : "Unit Price ($)"}
        </label>
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          min={0.01}
          step={0.01}
          placeholder="e.g., 1.25"
          className={`w-full rounded border px-3 py-2 ${existingItem ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
          disabled={!!existingItem}
        />
      </div>

      {!token && (
        <p className="text-sm text-gray-500">Please log in on the Auth page to contribute.</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!token}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
      >
        Submit Request
      </button>

      {/* Status Message (success or error) */}
      {status && (
        <p
          className={`text-sm ${status.toLowerCase().includes("added") || status.toLowerCase().includes("restocked") || status.toLowerCase().includes("submitted") ? "text-green-600" : "text-red-600"
            }`}
        >
          {status}
        </p>
      )}
    </form>
  );
});
