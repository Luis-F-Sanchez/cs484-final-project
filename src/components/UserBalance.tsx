import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex.tsx";
import { TEST_USER_ID } from "../lib/testUser.tsx";

export default withConvexProvider(function UserBalance() {
  const user = useQuery(api.queries.users_getByUserId, { userId: TEST_USER_ID });

  if (user === undefined) {
    return <p className="text-sm text-gray-500">Loading balance...</p>;
  }
  if (!user) {
    return <p className="text-sm text-red-600">User not found.</p>;
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Wallet</h3>
      <p className="mt-1 text-gray-700">
        User: <span className="font-mono">{user.userId}</span>
      </p>
      <p className="mt-2 text-2xl font-bold text-indigo-600">
        ${user.balance.toFixed(2)}
      </p>
    </div>
  );
});
