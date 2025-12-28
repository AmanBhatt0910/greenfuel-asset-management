"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import React from "react";
import { ArrowLeft, Plus } from "lucide-react";

/* ---------- Reusable Field ---------- */
const Field = React.memo(
  ({
    label,
    name,
    type = "text",
    placeholder = "",
    value,
    onChange,
    required,
  }) => (
    <div className="space-y-1">
      <label htmlFor={name} className="text-xs text-gray-400">
        {label} {required && <span className="text-green-400">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-xl bg-gray-800/80 border border-gray-700
                   text-sm text-white placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-green-500/40
                   transition-all"
      />
    </div>
  )
);

Field.displayName = "Field";

/* ---------- Page ---------- */
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

  /* ---------- Required fields ---------- */
  const requiredFields = [
    "asset_code",
    "make",
    "model",
    "serial_no",
    "invoice_no",
    "invoice_date",
    "amount",
    "vendor",
    "warranty_years",
    "warranty_start",
    "warranty_end",
  ];

  /* ---------- Validation ---------- */
  const isFormValid = useMemo(() => {
    return requiredFields.every(
      (key) => String(form[key]).trim() !== ""
    );
  }, [form]);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!isFormValid) {
      setMsg({
        type: "error",
        text: "Please fill all required fields before submitting.",
      });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSaving(false);
        setMsg({
          type: "error",
          text: "Not authenticated. Please log in again.",
        });
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
          amount: Number(form.amount),
          warranty_years: Number(form.warranty_years),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaving(false);
        setMsg({
          type: "error",
          text: data.message || "Failed to save asset",
        });
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Register New Asset</h2>
          <p className="text-gray-400 text-sm">
            Add a new asset to the inventory
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/assets")}
          className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700
                     flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Inventory
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Asset Code" name="asset_code" required value={form.asset_code} onChange={onChange} />
            <Field label="Make" name="make" required value={form.make} onChange={onChange} />
            <Field label="Model" name="model" required value={form.model} onChange={onChange} />
            <Field label="Serial No" name="serial_no" required value={form.serial_no} onChange={onChange} />
          </div>
        </section>

        {/* Purchase Info */}
        <section className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Purchase Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="PO No" name="po_no" value={form.po_no} onChange={onChange} />
            <Field label="Invoice No" name="invoice_no" required value={form.invoice_no} onChange={onChange} />
            <Field label="Invoice Date" name="invoice_date" type="date" required value={form.invoice_date} onChange={onChange} />
            <Field label="Amount" name="amount" type="number" required value={form.amount} onChange={onChange} />
            <Field label="Vendor" name="vendor" required value={form.vendor} onChange={onChange} />
          </div>
        </section>

        {/* Warranty */}
        <section className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Warranty Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Warranty (Years)" name="warranty_years" type="number" required value={form.warranty_years} onChange={onChange} />
            <Field label="Warranty Start Date" name="warranty_start" type="date" required value={form.warranty_start} onChange={onChange} />
            <Field label="Warranty End Date" name="warranty_end" type="date" required value={form.warranty_end} onChange={onChange} />
          </div>
        </section>

        {/* Message */}
        {msg.text && (
          <div
            className={`text-sm px-4 py-2 rounded-xl border ${
              msg.type === "success"
                ? "bg-green-600/10 text-green-300 border-green-700"
                : "bg-red-600/10 text-red-300 border-red-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving || !isFormValid}
            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700
                       font-semibold flex items-center gap-2 shadow-lg
                       disabled:opacity-50"
          >
            <Plus size={18} />
            {saving ? "Saving..." : "Register Asset"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
