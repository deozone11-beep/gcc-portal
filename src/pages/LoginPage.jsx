import { useState } from "react";
import "./LoginPage.css";

const VALID_USERS = [
  { username: "zone11", password: "gcc@2024" },
  { username: "admin", password: "admin@123" },
];

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const valid = VALID_USERS.find(
        (u) => u.username === username.trim() && u.password === password
      );
      if (valid) {
        onLogin();
      } else {
        setError("Invalid username or password.");
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div className="login-bg">
      <div className="login-overlay" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-circle">GCC</div>
        </div>
        <h1 className="login-title">Greater Chennai Corporation</h1>
        <p className="login-subtitle">Zone XI — Staff Portal</p>

        <div className="login-form">
          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
            />
          </div>

          {error && <p className="login-error">⚠ {error}</p>}

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="login-footer">
          Designed by{" "}
          <a
            href="https://maps.app.goo.gl/S12NiZi7Vw4K6GRK9"
            target="_blank"
            rel="noreferrer"
          >
            Zone-XI
          </a>
        </p>
      </div>
    </div>
  );
}
