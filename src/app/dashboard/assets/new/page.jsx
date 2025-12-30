// src/app/dashboard/assets/new/page.jsx

"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import React from "react";
import { ArrowLeft, Plus } from "lucide-react";

/* ============================
   Reusable Components
============================ */

// Field Input Component
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
      <label htmlFor={name} className="text-xs text-secondary">
        {label} {required && <span className="accent">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-xl surface border border-default
                   text-sm text-primary placeholder:text-secondary
                   focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]
                   transition-all"
      />
    </div>
  )
);

Field.displayName = "Field";

// Form Section Component
const FormSection = ({ title, children }) => (
  <section className="surface border border-default rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {children}
    </div>
  </section>
);

// Message Alert Component
const MessageAlert = ({ type, text }) => {
  if (!text) return null;

  return (
    <div
      className={`text-sm px-4 py-2 rounded-xl border ${
        type === "success"
          ? "accent-bg accent border-default"
          : "surface-muted text-danger border-default"
      }`}
    >
      {text}
    </div>
  );
};

// Submit Button Component
const SubmitButton = ({ disabled, saving, onClick }) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.02 } : {}}
    whileTap={!disabled ? { scale: 0.98 } : {}}
    type="submit"
    disabled={disabled}
    onClick={onClick}
    className="px-6 py-3 rounded-xl accent-strong text-primary
               font-semibold flex items-center gap-2 shadow-lg
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-opacity"
  >
    <Plus size={18} />
    {saving ? "Saving..." : "Register Asset"}
  </motion.button>
);

// Page Header Component
const PageHeader = ({ title, subtitle, onBack, backLabel }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h2 className="text-3xl font-bold text-primary">{title}</h2>
      <p className="text-secondary text-sm">{subtitle}</p>
    </div>

    <button
      onClick={onBack}
      className="px-4 py-2 rounded-xl surface-muted border border-default
                 flex items-center gap-2 text-secondary hover:surface transition-colors"
    >
      <ArrowLeft size={16} /> {backLabel}
    </button>
  </div>
);

/* ============================
   Main Page
============================ */
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

  // Form configuration - centralized field definitions
  const formSections = [
    {
      title: "Basic Information",
      fields: [
        { label: "Asset Code", name: "asset_code", required: true },
        { label: "Make", name: "make", required: true },
        { label: "Model", name: "model", required: true },
        { label: "Serial No", name: "serial_no", required: true },
      ],
    },
    {
      title: "Purchase Details",
      fields: [
        { label: "PO No", name: "po_no", required: false },
        { label: "Invoice No", name: "invoice_no", required: true },
        { label: "Invoice Date", name: "invoice_date", type: "date", required: true },
        { label: "Amount", name: "amount", type: "number", required: true },
        { label: "Vendor", name: "vendor", required: true },
      ],
    },
    {
      title: "Warranty Information",
      fields: [
        { label: "Warranty (Years)", name: "warranty_years", type: "number", required: true },
        { label: "Warranty Start Date", name: "warranty_start", type: "date", required: true },
        { label: "Warranty End Date", name: "warranty_end", type: "date", required: true },
      ],
    },
  ];

  // Extract required fields from configuration
  const requiredFields = useMemo(() => {
    return formSections.flatMap(section => 
      section.fields.filter(f => f.required).map(f => f.name)
    );
  }, []);

  const isFormValid = useMemo(() => {
    return requiredFields.every(
      (key) => String(form[key]).trim() !== ""
    );
  }, [form, requiredFields]);

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
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          warranty_years: Number(form.warranty_years),
        }),
      });

      if (res.status === 401) {
        window.location.href = "/";
        return;
      }

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
      <PageHeader
        title="Register New Asset"
        subtitle="Add a new asset to the inventory"
        onBack={() => router.push("/dashboard/assets")}
        backLabel="Back to Inventory"
      />

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Dynamic Sections */}
        {formSections.map((section) => (
          <FormSection key={section.title} title={section.title}>
            {section.fields.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                required={field.required}
                value={form[field.name]}
                onChange={onChange}
              />
            ))}
          </FormSection>
        ))}

        {/* Message */}
        <MessageAlert type={msg.type} text={msg.text} />

        {/* Submit Button */}
        <div className="flex justify-end">
          <SubmitButton
            disabled={saving || !isFormValid}
            saving={saving}
          />
        </div>
      </form>
    </motion.div>
  );
}