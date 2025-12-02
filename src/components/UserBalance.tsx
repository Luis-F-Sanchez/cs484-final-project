// ============================================
// USER BALANCE COMPONENT
// ============================================
// This component displays the user's wallet information:
// - User ID
// - Current account balance
//
// The balance increases when:
// - User contributes items to the co-op
//
// The balance decreases when:
// - User purchases items from the store
//
// Data is fetched in real-time from the Convex database
// and automatically updates when changes occur.
// ============================================

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex.tsx";
import { TEST_USER_ID } from "../lib/testUser.tsx";

export default withConvexProvider(function UserBalance() {
  // Query: Fetch user data by userId (real-time updates)
  const user = useQuery(api.queries.users_getByUserId, { userId: TEST_USER_ID });

  // Loading state: Show message while data is being fetched
  if (user === undefined) {
    return <p className="text-sm text-gray-500">Loading balance...</p>;
  }
  
  // Error state: User not found in database
  if (!user) {
    return <p className="text-sm text-red-600">User not found.</p>;
  }

  // Display user's balance information
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Wallet</h3>
      
      {/* Display user ID */}
      <p className="mt-1 text-gray-700">
        User: <span className="font-mono">{user.userId}</span>
      </p>
      
      {/* Display current balance */}
      <p className="mt-2 text-2xl font-bold text-indigo-600">
        ${user.balance.toFixed(2)}
      </p>
    </div>
  );
});
