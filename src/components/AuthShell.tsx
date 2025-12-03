import AuthPanel from "./AuthPanel";
import { useSessionToken } from "../lib/useSessionToken";

// =============================================================================
// This file wraps the AuthPanel with token storage. It reads/saves/clears the
// session token via useSessionToken and passes it into AuthPanel. Any page that
// renders AuthShell (or other components using the same hook) will pick up the 
// stored token, so that logic doesn't have to be rewritten every time.
// =============================================================================

export default function AuthShell() {
  const { token, saveToken, clearToken } = useSessionToken();
  return <AuthPanel token={token} saveToken={saveToken} clearToken={clearToken} />;
}