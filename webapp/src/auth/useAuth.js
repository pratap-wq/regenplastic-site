import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

function emailDomain(email) {
  const at = (email || "").lastIndexOf("@");
  return at > -1 ? email.slice(at + 1).toLowerCase() : "";
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }
      const email = (u.email || "").toLowerCase();
      const allowed = "regenplastic.com";
      if (!email || emailDomain(email) !== allowed) {
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { user, loading };
}
