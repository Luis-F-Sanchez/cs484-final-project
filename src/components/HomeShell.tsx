import UserBalance from "./UserBalance";
import Store from "./Store";
import { useSessionToken } from "../lib/useSessionToken";

// =============================================================================
// This file reads the token via useSessionToken, renders the home page content
// (UserBalance and Store), passing the token to each so they can fetch data/
// make mutations for the current user. This keeps the token wiring in one place
// for the home page instead of handling it in index.astro
// =============================================================================

export default function HomeShell() {
  const { token } = useSessionToken();

  return (
    <div className="space-y-6">
      <UserBalance token={token} />
      <Store token={token} />
    </div>
  );
}
