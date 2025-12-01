import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex.tsx";
import { TEST_USER_ID } from "../lib/testUser.tsx";
import React from "react";

type Selection = Record<string, number>;

export default withConvexProvider(function Store() {
  const items = useQuery(api.queries.inventory_getAll);
  const processPurchase = useMutation(api.queries.processPurchase);
  const [selection, setSelection] = React.useState<Selection>({});
  const [status, setStatus] = React.useState<string | null>(null);

  if (items === undefined) {
    return <p className="py-4 text-center text-gray-500">Loading inventory...</p>;
  }

  // Filter out items with 0 quantity
  const availableItems = items.filter((item) => item.quantity > 0);

  if (availableItems.length === 0) {
    return <p className="py-4 text-center text-gray-500">No items available.</p>;
  }

  const setItemQty = (id: string, max: number, value: string) => {
    const n = Math.max(0, Math.min(max, parseInt(value || "0", 10)));
    setSelection((prev) => ({ ...prev, [id]: isNaN(n) ? 0 : n }));
  };

  const totalSelected = Object.values(selection).reduce((a, b) => a + (b || 0), 0);
  
  const totalPrice = availableItems.reduce((sum, item) => {
    const qty = selection[item._id] ?? 0;
    return sum + (qty * item.price);
  }, 0);

  const handleBuySelected = async () => {
    setStatus(null);
    const itemsToBuy = Object.entries(selection)
      .filter(([_, qty]) => qty > 0)
      .map(([inventoryId, quantity]) => ({ inventoryId: inventoryId as any, quantity }));

    if (itemsToBuy.length === 0) return;

    try {
      await processPurchase({ userId: TEST_USER_ID, items: itemsToBuy });
      setStatus(`Purchase successful! Spent $${totalPrice.toFixed(2)}`);
      setSelection({});
    } catch (err: any) {
      setStatus(err.message || "Purchase failed");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Store</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableItems.map((item) => {
          const qty = selection[item._id] ?? 0;
          return (
            <div
              key={item._id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="mt-1 text-sm text-gray-600">In stock: {item.quantity}</p>
              <p className="mt-2 text-xl font-bold text-indigo-600">
                ${item.price.toFixed(2)}
              </p>

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
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-gray-700">
          <p>Selected items: <span className="font-semibold">{totalSelected}</span></p>
          <p>Total price: <span className="font-semibold text-indigo-600">${totalPrice.toFixed(2)}</span></p>
        </div>
        <button
          type="button"
          onClick={handleBuySelected}
          disabled={totalSelected === 0}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Buy Selected
        </button>
      </div>

      {status && (
        <p className={`text-sm ${status.includes("successful") ? "text-green-600" : "text-red-600"}`}>
          {status}
        </p>
      )}
    </div>
  );
});