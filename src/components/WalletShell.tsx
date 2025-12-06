import UserBalance from "./UserBalance";
import PurchaseHistory from "./PurchaseHistory";
import AddFunds from "./AddFunds"
import { useSessionToken } from "../lib/useSessionToken";

// =============================================================================
// Uses useSessionToken to read the current token. Then renders UserBalance and 
// PurchaseHistory, passing the token to both so they load the data for the
// logged in user. This file is used by wallet.astro to keep token handling out
// of the page file
// =============================================================================

export default function WalletShell() {
  const { token } = useSessionToken();
  return (
    <div className="space-y-4">
      <UserBalance token={token} />
      <AddFunds token={token} />
      <PurchaseHistory token={token} />
    </div>
  );
}
