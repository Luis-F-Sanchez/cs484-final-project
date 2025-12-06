import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex";
import { useSessionToken } from "../lib/useSessionToken";

// =============================================================================
// This file wraps shows pending contributions for administrators. It reads the 
// session token via useSessionToken and lists the pending items with approve/
// deny actions (admin only access)
// =============================================================================

function AdminShellInner() {
    const { token } = useSessionToken();
    const me = token ? useQuery(api.queries.users_me, { token }) : null;
    const approve = useMutation(api.queries.pending_approve);
    const deny = useMutation(api.queries.pending_deny);
    const pending = token ? useQuery(api.queries.pending_list, { token }) : null;
    
    // No session token found
    if (!token) { return <p className="text-sm text-gray-500">Admins only. Please log in.</p>; }
    // Loading requests
    if (me === undefined) return <p className="text-sm text-gray-500">Loading...</p>;
    // if the token does not belong to an admin account
    if (!me || !me.isAdmin) return <p className="text-sm text-gray-500">Admins only.</p>;
    // if the list of pending items is still being fetched
    if (pending === undefined) { return <p className="text-sm text-gray-500">Loading pending items...</p>; }
    // if the fetch failed
    if (!pending) { return <p className="text-sm text-red-600">Unable to load pending items.</p>; }
    // empty pending list
    if (pending.length === 0) { return <p className="text-sm text-gray-500">No pending contributions.</p>; }

    return (
    <div className="space-y-3">
      {pending.map(item => (
        <div key={item._id} className="flex items-start justify-between rounded border p-3">
          <div>
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-gray-600">
              Qty: {item.quantity} @ ${item.price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">User: {item.userId}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => approve({ token, pendingId: item._id })} className="rounded bg-green-600 px-3 py-1 text-white">Approve</button>
            <button onClick={() => deny({ token, pendingId: item._id })} className="rounded bg-red-600 border px-3 py-1 text-white">Deny</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const AdminShell = withConvexProvider(AdminShellInner);
export default AdminShell;