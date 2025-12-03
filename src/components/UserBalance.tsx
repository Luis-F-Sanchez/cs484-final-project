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

type Props = {
  variant?: "card" | "compact";
  token: string | null;
};

export default withConvexProvider(function UserBalance({ variant = "card", token }: Props) {
  const isCompact = variant === "compact";

  // Query: Fetch user data by userId (real-time updates)
  const user = token
    ? useQuery(api.queries.users_me, { token })
    : null;

  if (!token) {
    return (
      <p className={isCompact ? "text-xs text-gray-500" : "text-sm text-gray-500"}>
        Please log in to see your balance.
      </p>
    );
  }

  // Loading state: Show message while data is being fetched
  if (user === undefined) {
    return (
      <p className={isCompact ? "text-xs text-gray-500" : "text-sm text-gray-500"}>
        Loading balance...
      </p>
    );
  }
  
  // Error state: User not found in database
  if (!user) {
    return (
      <p className={isCompact ? "text-xs text-red-600" : "text-sm text-red-600"}>
        User not found.
      </p>
    );
  }

  // Display user's balance information
  return (
    <div
      className={
        isCompact
          ? "flex items-center gap-3 rounded-full border border-gray-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur"
          : "rounded-md border border-gray-200 bg-white p-4 shadow-sm"
      }
    >
      {isCompact ? (
        <>
          <div className="text-lg font-bold text-blue-600">
            {user.userId}
          </div>
        </>
      ) : (
        <>
          
          {/* Display user ID */}
          <p className="text-lg font-semibold ">
            Welcome <span>{user.userId}</span>
          </p>

          <h3 className="mt-1 text-gray-700">Balance</h3>
          
          {/* Display current balance */}
          <p className="mt-2 text-2xl font-bold text-blue-600">
            ${user.balance.toFixed(2)}
          </p>
        </>
      )}
    </div>
  );
});
