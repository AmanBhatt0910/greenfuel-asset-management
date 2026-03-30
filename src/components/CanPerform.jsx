// src/components/CanPerform.jsx
"use client";

import { useEffect, useState } from "react";

/**
 * Renders children only when the currently logged-in user holds
 * the specified permission. Falls back to `fallback` (default: null)
 * while loading or when the permission is not granted.
 *
 * Usage:
 *   <CanPerform permission="manage_users">
 *     <AdminOnlyButton />
 *   </CanPerform>
 */
export default function CanPerform({ permission, children, fallback = null }) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permission) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/auth/check-permission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permission }),
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled) setAllowed(Boolean(data.allowed));
      } catch {
        // silently deny on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    return () => { cancelled = true; };
  }, [permission]);

  if (loading) return null;
  return allowed ? children : fallback;
}
