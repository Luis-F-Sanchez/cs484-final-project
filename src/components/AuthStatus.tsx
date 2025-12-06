import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex";
import { useSessionToken } from "../lib/useSessionToken";

// ================================================================================
// This file defines the status text you see in the top right of the navbar when you
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

  // if the user is resolved, render the username and balance aligned with nav links
  return (
    <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
      <span>{user.username}</span>
      <span className="text-base font-semibold text-gray-600">
        ${user.balance.toFixed(2)}
      </span>
    </div>
  );
}

const AuthStatus = withConvexProvider(AuthStatusInner);
export default AuthStatus;
