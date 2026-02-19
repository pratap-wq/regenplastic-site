import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuth } from "../auth/useAuth";

function LoginCard() {
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ maxWidth: 520, width: "100%", border: "1px solid #e5e5e5", borderRadius: 18, padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Regenplastics Tracker</h2>
        <p style={{ opacity: 0.8 }}>
          Sign in with your <b>@regenplastic.com</b> Google account.
        </p>
        <button
          onClick={() => signInWithPopup(auth, googleProvider)}
          style={{ padding: "10px 14px", borderRadius: 12 }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function Tracker() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!user) return <LoginCard />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #eee" }}>
        <div>
          <b>Regenplastics Daily/Monthly Tracker</b>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{user.email}</div>
        </div>
        <button onClick={() => signOut(auth)} style={{ padding: "8px 12px", borderRadius: 12 }}>
          Logout
        </button>
      </div>

      <div style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Tasks (Wave-1)</h3>
        <p style={{ opacity: 0.75, marginTop: 6 }}>
          Next step: connect to Google Sheets via Apps Script API to list/add/update tasks by vertical.
        </p>

        <div style={{ border: "1px solid #e5e5e5", borderRadius: 18, padding: 16 }}>
          <b>Verticals</b>
          <div style={{ marginTop: 10, opacity: 0.7 }}>
            Production • Quality • Purchase • Sales • Dispatch • Maintenance • HR • Accounts • EPR/Compliance
          </div>
          <hr style={{ margin: "16px 0", border: 0, borderTop: "1px solid #eee" }} />
          <div style={{ opacity: 0.7 }}>
            UI is ready. API wiring comes next (Tasks sheet + Apps Script endpoints).
          </div>
        </div>
      </div>
    </div>
  );
}
