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
    if (!issueId) return alert("Invalid issue reference");

    setLoading(true);
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/issues/${issueId}/return`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("Failed to return asset");
      setLoading(false);
      return;
    }

    router.push("/dashboard/assets");
  };

  return (
    <div className="max-w-xl bg-gray-900 p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-2">
        Return Asset
      </h2>
      <p className="text-gray-400 mb-4">
        This asset will be moved back to inventory.
      </p>

      <button
        onClick={handleReturn}
        disabled={loading}
        className="px-6 py-3 bg-green-600 rounded-lg text-white disabled:opacity-50"
      >
        {loading ? "Processing…" : "Confirm Return"}
      </button>
    </div>
  );
}
