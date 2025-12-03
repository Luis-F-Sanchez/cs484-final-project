import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex";

type Mode = "login" | "register";

// ==================================================================================================// AUTHPANEL : minimal username-based auth UI
// - this file handles login/registration via convex mutations and delivers errors for when users do 
//   not provide valid input
// - also saves/clears session tokens through parent-provided callbacks (token storage lives outside)
// - Shows status messages and a logout button when a valid token is present
// NOTE: This is a demo only work flow (no passwords/OAUTH); ideally would use UIC credentials for
//       authentication; sessions are created on register/login and are stored in convex
// ==================================================================================================

// receives token, saveToken, and clearToken from the parent (token storage handled outside)
type Props = {
  token: string | null;
  saveToken: (token: string) => void;
  clearToken: () => void;
};

function AuthPanelInner({ token, saveToken, clearToken }: Props) {
  // username
  const [username, setUsername] = useState("");
  // mode: login or register
  const [mode, setMode] = useState<Mode>("login");
  // status messages
  const [status, setStatus] = useState<string | null>(null);
  // error messages
  const [error, setError] = useState<string | null>(null);

  // use the defined query functions
  const register = useMutation(api.queries.auth_register);
  const login = useMutation(api.queries.auth_login);

  // trims the username, if empty sets an error; calls either login or register based on the current mode. On success,
  // saves the returned token and sets a status message. On failure, shows the error; for login, a "User not found"
  // message is shown to the user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Enter a username");
      return;
    }
    try {
      const action = mode === "login" ? login : register;
      const result = await action({ username: trimmed });
      if (result?.token) {
        saveToken(result.token);
        setStatus(`${mode === "login" ? "Logged in" : "Registered"} as ${trimmed}`);
      } else {
        setError("No token returned");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      if (mode === "login" && msg.toLowerCase().includes("no such user")) {
        setError(`User "${trimmed}" not found. Please register or check the name.`);
      } else {
        setError(msg);
      }
    }
  };

  // clears the token and shows "Logged out"
  const handleLogout = () => {
    clearToken();
    setStatus("Logged out");
    setError(null);
  };

  // HTML structure for the login panel
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={mode === "login" ? "font-bold text-blue-600" : "text-gray-500"}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={mode === "register" ? "font-bold text-blue-600" : "text-gray-500"}
          >
            Register
          </button>
        </div>
      </div>

      <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your name"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
          {token && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          )}
        </div>
      </form>

      {status && <div className="mt-2 text-xs text-green-600">{status}</div>}
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );
}

const AuthPanel = withConvexProvider(AuthPanelInner);
export default AuthPanel;