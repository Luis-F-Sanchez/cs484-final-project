// ============================================
// PURCHASE HISTORY COMPONENT
// ============================================
// This component displays a list of all purchases made by the user.
// It shows:
// - Item name and quantity purchased
// - Unit price and total cost
// - Date/time of purchase
// - Inventory ID reference
//
// The data is fetched from the Convex database using a query
// that filters purchases by the current user's ID.
// ============================================

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex.tsx";

type Props = { token: string | null };

export default withConvexProvider(function PurchaseHistory({ token }: Props) {
  const purchases = token
    ? useQuery(api.queries.purchases_listByUser, { token })
    : null;

  if (!token) {
    return <p className="text-sm text-gray-500">Please log in to see purchases.</p>;
  }

  if (purchases === null) {
    return <p className="text-sm text-gray-500">Please log in to see purchases.</p>;
  }

  // Show loading state while data is being fetched
  if (purchases === undefined) {
    return <p className="text-sm text-gray-500">Loading purchase history...</p>;
  }
  
  // Show message if user hasn't made any purchases yet
  if (purchases.length === 0) {
    return <p className="text-sm text-gray-500">No purchases yet.</p>;
  }

  // Render the list of purchases
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Purchase History</h3>
      <ul className="divide-y divide-gray-200">
        {/* Map through each purchase and display its details */}
        {purchases.map((p) => (
          <li key={p._id} className="py-2 flex items-center justify-between">
            <div>
              {/* Item name and quantity */}
              <p className="font-medium text-gray-900">
                {p.itemName} × {p.quantity}
              </p>
              
              {/* Pricing information */}
              <p className="text-sm text-gray-600">
                ${p.unitPrice.toFixed(2)} each — Total: ${p.totalCost.toFixed(2)}
              </p>
              
              {/* Timestamp - when the purchase was made */}
              <p className="text-xs text-gray-500">
                {new Date(p.timestamp).toLocaleString()}
              </p>
            </div>
            
            {/* Inventory ID reference */}
            <span className="text-sm font-mono text-gray-500">#{p.inventoryId}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});
