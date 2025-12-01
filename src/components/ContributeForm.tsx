import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex.tsx";
import { TEST_USER_ID } from "../lib/testUser.tsx";


export default withConvexProvider(function ContributeForm() {
  const addItem = useMutation(api.queries.inventory_addItem);
  const adjustBalance = useMutation(api.queries.users_adjustBalance);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const qtyNum = parseInt(quantity, 10);
    const priceNum = parseFloat(unitPrice);

    if (!name.trim()) return setStatus("Item name is required.");
    if (isNaN(qtyNum) || qtyNum <= 0) return setStatus("Quantity must be a positive integer.");
    if (isNaN(priceNum) || priceNum <= 0) return setStatus("Unit price must be a positive number.");

    const totalSpent = qtyNum * priceNum;

    try {
      await addItem({ name: name.trim(), quantity: qtyNum, price: priceNum });
      // Increment the user's balance by the total spent
      await adjustBalance({ userId: TEST_USER_ID, delta: totalSpent });

      setStatus(`Added "${name}" and credited $${totalSpent.toFixed(2)} to balance.`);
      setName("");
      setQuantity("");
      setUnitPrice("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to contribute item. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Contribute an Item</h2>

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

      <button
        type="submit"
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Contribute
      </button>

      {status && <p className="text-sm text-gray-700">{status}</p>}
    </form>
  );
});