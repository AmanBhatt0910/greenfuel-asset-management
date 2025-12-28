// src/app/dashboard/assets/[id]/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Save,
  UserPlus,
  ArrowRightLeft,
  RotateCcw,
  Trash2,
  Settings,
} from "lucide-react";

export default function AssetDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const search = useSearchParams();
  const isEdit = search.get("mode") === "edit";

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  /* ============================
     Fetch Asset + History
  ============================ */
  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");

      try {
        const [assetRes, historyRes] = await Promise.all([
          fetch(`/api/assets/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/assets/${id}/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const assetData = await assetRes.json();
        const historyData = await historyRes.json();

        setForm(assetData);
        setHistory(historyData.timeline || []);
      } catch (err) {
        console.error("Failed to load asset or history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  /* ============================
     Handlers
  ============================ */
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

  /* ============================
     Icon + Message Mapper
  ============================ */
  const getEventMeta = (h) => {
    switch (h.event_type) {
      case "ISSUED":
        return {
          icon: <UserPlus size={14} className="text-blue-400" />,
          text: `Issued to ${h.employee_name} (${h.emp_code})`,
        };

      case "TRANSFER":
        return {
          icon: <ArrowRightLeft size={14} className="text-yellow-400" />,
          text: `Transferred from ${h.from_emp_code} to ${h.to_emp_code}`,
        };

      case "RETURNED":
        return {
          icon: <RotateCcw size={14} className="text-gray-400" />,
          text: "Returned to Inventory",
        };

      case "GARBAGE":
        return {
          icon: <Trash2 size={14} className="text-red-400" />,
          text: "Marked as Garbage",
        };

      default:
        return {
          icon: <Settings size={14} className="text-purple-400" />,
          text: h.description || "System update",
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* ================= Header ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Asset {isEdit ? "Edit" : "Details"}
          </h2>
          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            {form?.asset_code}
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
              onClick={() =>
                router.push(`/dashboard/assets/${id}?mode=edit`)
              }
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Edit size={16} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* ================= Details ================= */}
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
              value={form?.[name] || ""}
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

      {/* ================= Asset Usage History ================= */}
      <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-green-400 mb-4">
          Asset Usage History
        </h3>

        {history.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No usage history found for this asset.
          </p>
        ) : (
          <ol className="relative border-l border-gray-700 space-y-6">
            {history.map((h, idx) => {
              const { icon, text } = getEventMeta(h);

              return (
                <li key={idx} className="ml-6">
                  <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-green-500" />

                  <div className="flex items-start gap-2">
                    {icon}
                    <p className="text-sm text-white font-medium">
                      {text}
                    </p>
                  </div>

                  <p className="text-xs text-gray-400 mt-1 ml-6">
                    {new Date(h.event_date).toLocaleString()}
                    {h.performed_by && ` • ${h.performed_by}`}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* ================= Sticky Save ================= */}
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
