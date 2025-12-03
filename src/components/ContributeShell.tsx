import ContributeForm from "./ContributeForm";
import { useSessionToken } from "../lib/useSessionToken";

// =============================================================================
// This file uses useSessionToken to pull the current token from localStorage.
// It then renders the contribution form with that token prop. This keeps the 
// token handling separate from the form so we can drop this shell into
// contribute.astro without repeating the hook wiring
// =============================================================================

export default function ContributeShell() {
  const { token } = useSessionToken();
  return <ContributeForm token={token} />;
}
