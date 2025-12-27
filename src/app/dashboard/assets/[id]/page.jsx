// src/app/dashboard/assets/[id]/page.jsx

"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Save } from "lucide-react";

export default function AssetDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const search = useSearchParams();
  const isEdit = search.get("mode") === "edit";

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setForm(data);
      setLoading(false);
    };
    fetchAsset();
  }, [id]);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/assets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      setMsg("Asset updated successfully");
      router.replace(`/dashboard/assets/${id}?mode=view`);
    }
  };

  if (loading) return <p className="text-gray-400">Loading asset…</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Asset {isEdit ? "Edit" : "Details"}
          </h2>
          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            {form.asset_code}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard/assets")}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {!isEdit && (
            <button
              onClick={() => router.push(`/dashboard/assets/${id}?mode=edit`)}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Edit size={16} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Details Card */}
      <form
        onSubmit={onSubmit}
        className="bg-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xl"
      >
        {[
          ["asset_code", "Asset Code"],
          ["make", "Make"],
          ["model", "Model"],
          ["serial_no", "Serial No"],
          ["po_no", "PO No"],
          ["invoice_no", "Invoice No"],
          ["invoice_date", "Invoice Date", "date"],
          ["amount", "Amount", "number"],
          ["vendor", "Vendor"],
          ["warranty_years", "Warranty (Years)", "number"],
          ["warranty_start", "Warranty Start", "date"],
          ["warranty_end", "Warranty End", "date"],
        ].map(([name, label, type = "text"]) => (
          <div key={name} className="space-y-1">
            <label className="text-xs text-gray-400">{label}</label>
            <input
              type={type}
              name={name}
              disabled={!isEdit}
              value={form[name] || ""}
              onChange={onChange}
              className={`w-full px-4 py-2 rounded-xl text-sm border transition-all
                ${
                  isEdit
                    ? "bg-gray-800 border-gray-600 focus:ring-2 focus:ring-green-500/40"
                    : "bg-gray-900 border-gray-800 text-gray-400 cursor-not-allowed"
                }`}
            />
          </div>
        ))}
      </form>

      {/* Sticky Save */}
      {isEdit && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            onClick={onSubmit}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-semibold flex items-center gap-2 shadow-lg"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}

      {msg && <p className="text-green-400 text-sm">{msg}</p>}
    </motion.div>
  );
}
