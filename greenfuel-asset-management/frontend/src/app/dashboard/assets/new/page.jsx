"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import React from "react";

// ✅ FIX: Moved Field component outside to prevent re-creation on each render
const Field = React.memo(({ label, name, type = "text", placeholder = "", value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-gray-300 mb-1">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>
));

Field.displayName = 'Field';

export default function NewAssetPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    asset_code: "",
    make: "",
    model: "",
    serial_no: "",
    po_no: "",
    invoice_no: "",
    invoice_date: "",
    amount: "",
    vendor: "",
    warranty_years: "",
    warranty_start: "",
    warranty_end: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSaving(false);
        setMsg({ type: "error", text: "Not authenticated. Please log in again." });
        return;
      }

      const res = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          amount: form.amount ? Number(form.amount) : null,
          warranty_years: form.warranty_years ? Number(form.warranty_years) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaving(false);
        setMsg({ type: "error", text: data.message || "Failed to save asset" });
        return;
      }

      setMsg({ type: "success", text: "Asset registered successfully!" });
      setTimeout(() => router.push("/dashboard/assets"), 800);
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Server error" });
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h2 className="text-2xl font-bold mb-6 text-green-400">New Asset Registration</h2>

      <form onSubmit={onSubmit} className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Asset Code*" name="asset_code" placeholder="GF-001" value={form.asset_code} onChange={onChange} />
          <Field label="Asset Make" name="make" placeholder="Dell, HP" value={form.make} onChange={onChange} />
          <Field label="Asset Model" name="model" placeholder="Latitude 3420" value={form.model} onChange={onChange} />

          <Field label="Serial No*" name="serial_no" placeholder="SN-XXXX" value={form.serial_no} onChange={onChange} />
          <Field label="PO No" name="po_no" placeholder="PO-1234" value={form.po_no} onChange={onChange} />
          <Field label="Invoice No" name="invoice_no" placeholder="INV-5678" value={form.invoice_no} onChange={onChange} />

          <Field label="Invoice Date" name="invoice_date" type="date" value={form.invoice_date} onChange={onChange} />
          <Field label="Amount" name="amount" type="number" placeholder="55000" value={form.amount} onChange={onChange} />
          <Field label="Vendor" name="vendor" placeholder="Greenfuel Vendor" value={form.vendor} onChange={onChange} />

          <Field label="Warranty (Years)" name="warranty_years" type="number" placeholder="3" value={form.warranty_years} onChange={onChange} />
          <Field label="Warranty Start Date" name="warranty_start" type="date" value={form.warranty_start} onChange={onChange} />
          <Field label="Warranty End Date" name="warranty_end" type="date" value={form.warranty_end} onChange={onChange} />
        </div>

        {msg.text && (
          <div
            className={`text-sm px-4 py-2 rounded-lg ${
              msg.type === "success"
                ? "bg-green-600/20 text-green-300 border border-green-700"
                : "bg-red-600/20 text-red-300 border border-red-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : "Register Asset"}
        </motion.button>
      </form>
    </motion.div>
  );
}