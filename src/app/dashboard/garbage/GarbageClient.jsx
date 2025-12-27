// app/dashboard/garbage/GarbageClient.jsx

"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

export default function GarbageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const presetAsset = params.get("asset");

  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    asset_code: presetAsset || "",
    reason: "",
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/assets?available=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssets(data);
    };
    fetchAssets();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.confirm) return alert("Please confirm garbage action");

    setLoading(true);
    const token = localStorage.getItem("token");

    await fetch("/api/garbage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        asset_code: form.asset_code,
        reason: form.reason,
        disposed_date: new Date().toISOString().split("T")[0],
      }),
    });

    router.push("/dashboard/assets");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Trash2 className="text-red-400" /> Mark Asset as Garbage
      </h2>

      <form
        onSubmit={submit}
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-6"
      >
        <FormSelect
          label="Select Asset"
          value={form.asset_code}
          options={assets.map((a) => a.asset_code)}
          onChange={(e) =>
            setForm({ ...form, asset_code: e.target.value })
          }
        />

        <FormInput
          label="Reason / Remarks"
          placeholder="Damaged, obsolete, end of life…"
          value={form.reason}
          onChange={(e) =>
            setForm({ ...form, reason: e.target.value })
          }
        />

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            className="accent-red-500"
            checked={form.confirm}
            onChange={(e) =>
              setForm({ ...form, confirm: e.target.checked })
            }
          />
          I confirm this asset is permanently unusable.
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Processing..." : "Mark as Garbage"}
          </button>
        </div>
      </form>
    </div>
  );
}
