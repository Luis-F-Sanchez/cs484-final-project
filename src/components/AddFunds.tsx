import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex";

// ==============================================================================
// AddFunds: this file allows users to add money to the current user's balance; 
// this is done by accepting the session token as a prop (if not logged in,
// feature is disabled); this function validates that a positive amount has 
// been entered, calls users_adjustBalance, and shows the appropriate status msg
// ==============================================================================

// token passed down from shell/page
type Props = { token: string | null};

function AddFundsInner({ token } : Props) {
    // local state for input and status message
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState<string | null>(null);

    // mutation to adjust the user's balance
    const adjustBalance = useMutation(api.queries.users_adjustBalance);

    // submit the request to add funds
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        // if the user is currently not logged in
        if(!token) {
            setStatus("Please log in");
            return;
        }

        // if the value entered is not a number or is not a positive number
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            setStatus("Please deposit a positive amount");
            return;
        }

        // try to submit the form
        try {
            await adjustBalance({ token, delta: value });
            // success
            setStatus(`Added $${value.toFixed(2)} to your balance`);
            setAmount("");
        } catch (err) {
            // error
            setStatus(err instanceof Error ? err.message : "Failed to add funds")
        }
    }
    
    // UI (input field, button, status)
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-3 shadow-sm">
        <label className="text-sm font-medium text-gray-700">Add Funds</label>
        <div className="flex items-center gap-2">
            <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-32 rounded border px-2 py-1 text-sm"
            placeholder="10.00"
        />
        <button
            type="submit"
            disabled={!token}
            className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">
            Add Funds
        </button>
      </div>
        {status && (<p className={`text-sm ${status.toLowerCase().includes("added") ? "text-green-600" : "text-red-600"}`}>{status}</p>)}
    </form>
  );
}

const AddFunds = withConvexProvider(AddFundsInner);
export default AddFunds;