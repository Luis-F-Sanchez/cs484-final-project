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
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex.tsx";
import { TEST_USER_ID } from "../lib/testUser.tsx";

export default withConvexProvider(function ContributeForm() {
  // Set up mutations (database write operations) from Convex
  const addItem = useMutation(api.queries.inventory_addItem);           // Adds item to inventory
  const adjustBalance = useMutation(api.queries.users_adjustBalance);   // Updates user's balance

  // Form state - tracks user input
  const [name, setName] = useState("");           // Item name (e.g., "Apples")
  const [quantity, setQuantity] = useState("");   // How many units
  const [unitPrice, setUnitPrice] = useState(""); // Price per unit
  const [status, setStatus] = useState<string | null>(null); // Success/error messages

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
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
      // Step 1: Add item to inventory
      await addItem({ name: name.trim(), quantity: qtyNum, price: priceNum });
      
      // Step 2: Credit the user's balance with the total value
      await adjustBalance({ userId: TEST_USER_ID, delta: totalSpent });

      // Show success message and clear form
      setStatus(`Added "${name}" and credited $${totalSpent.toFixed(2)} to balance.`);
      setName("");
      setQuantity("");
      setUnitPrice("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to contribute item. Please try again.");
    }
  };

  // Render the form UI
  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Contribute an Item</h2>

      {/* Item Name Input */}
      <div>
        <label className="block text-sm font-medium mb-1">Item Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Apples"
          className="w-full rounded border px-3 py-2"
        />
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
        <label className="block text-sm font-medium mb-1">Unit Price ($)</label>
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          min={0.01}
          step={0.01}
          placeholder="e.g., 1.25"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Contribute
      </button>

      {/* Status Message (success or error) */}
      {status && <p className="text-sm text-gray-700">{status}</p>}
    </form>
  );
});