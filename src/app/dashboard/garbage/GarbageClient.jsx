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
      const res = await fetch("/api/assets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssets(data.filter((a) => a.status === "IN_STOCK"));
    };
    fetchAssets();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.confirm) return alert("Please confirm garbage action");

    const asset = assets.find((a) => a.asset_code === form.asset_code);
    if (!asset) return alert("Invalid asset selected");

    setLoading(true);
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/assets/${asset.id}/garbage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: form.reason }),
    });

    if (!res.ok) {
      alert("Failed to mark asset as garbage");
      setLoading(false);
      return;
    }

    router.push("/dashboard/assets");
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
        <Trash2 className="text-danger" />
        Mark Asset as Garbage
      </h2>

      {/* Form */}
      <form
        onSubmit={submit}
        className="surface border border-default rounded-2xl p-6 space-y-6"
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

        <label className="flex items-center gap-2 text-sm text-secondary">
          <input
            type="checkbox"
            className="accent"
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
            className="px-6 py-3 rounded-lg font-semibold
                       border border-default
                       text-danger accent-bg
                       disabled:opacity-50"
          >
            {loading ? "Processing..." : "Mark as Garbage"}
          </button>
        </div>
      </form>
    </div>
  );
}
