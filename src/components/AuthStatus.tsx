import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex";
import { useSessionToken } from "../lib/useSessionToken";

// ================================================================================
// This file defines the status pill you see in top right in the navbar when you
// are logged in. It reads the saved token, fetches the current user with users_me,
// and shows the user their username/balance. If there is no token, it renders a 
// blank placeholder.
// ================================================================================

function AuthStatusInner() {
  const { token } = useSessionToken();
  const user = token ? useQuery(api.queries.users_me, { token }) : null;

  // if there is no session token, render a blank placeholder
  if (!token) { return <span className="text-sm text-gray-400">&nbsp;</span>; }

  // User still being fetched: "Loading user..."
  if (user === undefined) { return <span className="text-sm text-gray-500">Loading user...</span>; }

  // User doesn't exist: blank placeholder
  if (!user) { return <span className="text-sm text-gray-400">&nbsp;</span>; }

  // if the user is resolved, i.e. everything is as it should be, render the username and balance in the top right
  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-sm shadow-sm backdrop-blur">
      <span className="font-semibold text-gray-900">{user.username}</span>
      <span className="text-xs text-gray-500">${user.balance.toFixed(2)}</span>
    </div>
  );
}

const AuthStatus = withConvexProvider(AuthStatusInner);
export default AuthStatus;