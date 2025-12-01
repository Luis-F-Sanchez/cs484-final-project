import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex.tsx";
import { TEST_USER_ID } from "../lib/testUser.tsx";

export default withConvexProvider(function PurchaseHistory() {
  const purchases = useQuery(api.queries.purchases_listByUser, { userId: TEST_USER_ID });

  if (purchases === undefined) {
    return <p className="text-sm text-gray-500">Loading purchase history...</p>;
  }
  if (purchases.length === 0) {
    return <p className="text-sm text-gray-500">No purchases yet.</p>;
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Purchase History</h3>
      <ul className="divide-y divide-gray-200">
        {purchases.map((p) => (
          <li key={p._id} className="py-2 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {p.itemName} × {p.quantity}
              </p>
              <p className="text-sm text-gray-600">
                ${p.unitPrice.toFixed(2)} each — Total: ${p.totalCost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(p.timestamp).toLocaleString()}
              </p>
            </div>
            <span className="text-sm font-mono text-gray-500">#{p.inventoryId}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});