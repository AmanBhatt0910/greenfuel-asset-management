// app/dashboard/garbage/GarbageClient.jsx
"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import FormInput from "@/components/FormInput";
import FormSelectSearchable from "@/components/FormSelectSearchable";

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
      try {
        const res = await fetch("/api/assets", {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/";
          return;
        }

        const data = await res.json();
        setAssets(data.filter((a) => a.status === "IN_STOCK"));
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      }
    };
    fetchAssets();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.confirm) {
      alert("Please confirm garbage action");
      return;
    }

    const asset = assets.find((a) => a.asset_code === form.asset_code);
    if (!asset) {
      alert("Invalid asset selected");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/assets/${asset.id}/garbage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reason: form.reason }),
      });

      if (res.status === 401) {
        window.location.href = "/";
        return;
      }

      if (!res.ok) {
        alert("Failed to mark asset as garbage");
        setLoading(false);
        return;
      }

      router.push("/dashboard/assets");
    } catch (err) {
      console.error("Failed to mark asset as garbage:", err);
      alert("Failed to mark asset as garbage");
      setLoading(false);
    }
  };

  // Create options with more detailed labels for better searchability
  const assetOptions = assets.map((a) => ({
    value: a.asset_code,
    label: `${a.asset_code} - ${a.make} ${a.model} (${a.serial_no})`,
  }));

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
        <FormSelectSearchable
          label="Select Asset"
          value={form.asset_code}
          options={assetOptions}
          onChange={(e) =>
            setForm({ ...form, asset_code: e.target.value })
          }
          placeholder="Search by asset code, make, model, or serial..."
          searchPlaceholder="Type to search assets..."
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