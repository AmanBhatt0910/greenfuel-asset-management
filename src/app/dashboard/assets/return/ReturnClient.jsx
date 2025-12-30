// app/dashboard/assets/return/ReturnClient.jsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ReturnClient() {
  const params = useSearchParams();
  const issueId = params.get("issue");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReturn = async () => {
    if (!issueId) {
      alert("Invalid issue reference");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/issues/${issueId}/return`, {
        method: "POST",
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/";
        return;
      }

      if (!res.ok) {
        alert("Failed to return asset");
        setLoading(false);
        return;
      }

      router.push("/dashboard/assets");
    } catch (err) {
      console.error("Failed to return asset:", err);
      alert("Failed to return asset");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl surface p-6 rounded-xl border border-default">
      <h2 className="text-xl font-semibold text-primary mb-2">
        Return Asset
      </h2>
      <p className="text-secondary mb-4">
        This asset will be moved back to inventory.
      </p>

      <button
        onClick={handleReturn}
        disabled={loading}
        className="px-6 py-3 rounded-lg
                   accent-bg accent-strong
                   border border-default
                   disabled:opacity-50"
      >
        {loading ? "Processing…" : "Confirm Return"}
      </button>
    </div>
  );
}