// ============================================
// CONTRIBUTION HISTORY COMPONENT
// ============================================
// This component displays a list of all contributions made by the user.
// It shows:
// - Item name and quantity contributed
// - Unit price and total value
// - Date/time of contribution request
// - Status (pending or approved)
//
// The data is fetched from the Convex database using a query
// that filters contributions by the current user's ID and combines
// both pending and finalized contributions.
// ============================================

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex.tsx";

type Props = { token: string | null };

export default withConvexProvider(function ContributionHistory({ token }: Props) {
  const contributions = token
    ? useQuery(api.queries.contributions_historyByUser, { token })
    : null;

  if (!token) {
    return <p className="text-sm text-gray-500">Please log in to see contributions.</p>;
  }

  if (contributions === null) {
    return <p className="text-sm text-gray-500">Please log in to see contributions.</p>;
  }

  if (contributions === undefined) {
    return <p className="text-sm text-gray-500">Loading contribution history...</p>;
  }

  // Show message if user hasn't made any contributions yet
  if (contributions.length === 0) {
    return <p className="text-sm text-gray-500">No contributions yet.</p>;
  }

  // Render the list of contributions
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Contribution History</h3>
      <ul className="divide-y divide-gray-200">
        {/* Map through each contribution and display its details */}
        {contributions.map((c) => (
          <li key={c._id} className="py-2 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {c.itemName} × {c.quantity}
              </p>
              <p className="text-sm text-gray-600">
                ${c.unitPrice.toFixed(2)} each — Total: ${c.totalValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(c.timestamp).toLocaleString()}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                c.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {c.status === "pending" ? "Pending" : "Approved"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});
