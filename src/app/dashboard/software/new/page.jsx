"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  ShieldCheck,
  Calendar,
  FileText,
} from "lucide-react";

export default function NewSoftwarePage() {

  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({

    name: "",
    version: "",
    vendor: "",

    license_type: "PERPETUAL",

    license_key: "",

    purchase_date: "",

    expiry_date: "",

    seats_total: 1,

    notes: "",

  });

  const onChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "seats_total"
          ? Number(value)
          : value,
    });

  };

  const isValid = useMemo(() =>
    form.name.trim() !== "" &&
    form.seats_total > 0
  , [form]);

  const onSubmit = async (e) => {

    e.preventDefault();

    if (!isValid)
      return;

    setSaving(true);

    setMsg("");

    try {

      const res = await fetch("/api/software", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify(form),

      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message);

      setMsg("Software registered successfully");

      setTimeout(() =>
        router.push("/dashboard/software")
      , 800);

    } catch (err) {

      setMsg(err.message || "Failed to register");

    } finally {

      setSaving(false);

    }

  };

  return (

    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >

      {/* Header */}
      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-3xl font-bold text-primary">
            Register Software
          </h2>

          <p className="text-secondary text-sm">
            Add new software license to inventory
          </p>

        </div>

        <button
          onClick={() => router.push("/dashboard/software")}
          className="
            surface-muted border-default
            px-4 py-2 rounded-xl flex gap-2 items-center
            text-secondary
          "
        >
          <ArrowLeft size={16}/>
          Back
        </button>

      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="space-y-6"
      >

        {/* Basic */}
        <Section title="Basic Information" icon={FileText}>

          <Field
            label="Software Name"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />

          <Field
            label="Version"
            name="version"
            value={form.version}
            onChange={onChange}
          />

          <Field
            label="Vendor"
            name="vendor"
            value={form.vendor}
            onChange={onChange}
          />

        </Section>

        {/* License */}
        <Section title="License Information" icon={ShieldCheck}>

          <SelectField
            label="License Type"
            name="license_type"
            value={form.license_type}
            onChange={onChange}
            options={[
              "PERPETUAL",
              "SUBSCRIPTION",
              "TRIAL",
              "OEM",
              "CONCURRENT",
            ]}
          />

          <Field
            label="License Key"
            name="license_key"
            value={form.license_key}
            onChange={onChange}
          />

          <Field
            label="Total Seats"
            name="seats_total"
            type="number"
            value={form.seats_total}
            onChange={onChange}
          />

        </Section>

        {/* Dates */}
        <Section title="Dates" icon={Calendar}>

          <Field
            label="Purchase Date"
            name="purchase_date"
            type="date"
            value={form.purchase_date}
            onChange={onChange}
          />

          <Field
            label="Expiry Date"
            name="expiry_date"
            type="date"
            value={form.expiry_date}
            onChange={onChange}
          />

        </Section>

        {/* Notes */}
        <Section title="Notes">

          <TextArea
            name="notes"
            value={form.notes}
            onChange={onChange}
          />

        </Section>

        {/* Message */}
        {msg && (

          <div className="
            px-4 py-3 rounded-xl
            accent-bg accent border-default text-sm
          ">
            {msg}
          </div>

        )}

        {/* Submit */}
        <div className="flex justify-end">

          <button
            type="submit"
            disabled={saving || !isValid}
            className="
              accent-strong text-primary
              px-6 py-3 rounded-xl
              font-semibold flex gap-2 items-center
              shadow-lg disabled:opacity-50
            "
          >
            <Plus size={18}/>
            {saving
              ? "Registering..."
              : "Register Software"}
          </button>

        </div>

      </form>

    </motion.div>

  );

}

/* Components */

function Section({ title, icon: Icon, children }) {

  return (

    <div className="
      surface border-default rounded-2xl p-6
      space-y-4
    ">

      {title && (

        <div className="flex items-center gap-2">

          {Icon && <Icon size={18} className="accent"/>}

          <h3 className="font-semibold text-primary">
            {title}
          </h3>

        </div>

      )}

      <div className="
        grid grid-cols-1 md:grid-cols-2 gap-4
      ">
        {children}
      </div>

    </div>

  );

}

function Field({
  label,
  name,
  type="text",
  value,
  onChange,
  required,
}) {

  return (

    <div className="space-y-1">

      <label htmlFor={name} className="text-xs text-secondary">
        {label}
        {required && <span className="accent"> *</span>}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="
          w-full px-4 py-2 rounded-xl
          surface border border-default
          text-sm text-primary
          placeholder:text-secondary
          focus:outline-none
          focus:ring-2 focus:ring-[color:var(--accent-soft)]
          focus:border-[color:var(--accent)]
          transition-all
        "
      />

    </div>

  );

}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {

  return (

    <div className="space-y-1">

      <label htmlFor={name} className="text-xs text-secondary">
        {label}
      </label>
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full px-4 py-2 rounded-xl
          surface border border-default
          text-sm text-primary
          focus:outline-none
          focus:ring-2 focus:ring-[color:var(--accent-soft)]
          focus:border-[color:var(--accent)]
          transition-all
        "
      >
        {options.map(o =>
          <option key={o} value={o}>
            {o}
          </option>
        )}
      </select>

    </div>

  );

}

function TextArea({
  name,
  value,
  onChange,
}) {

  return (

    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={4}
      className="
        w-full px-4 py-2 rounded-xl
        surface border border-default
        text-sm text-primary
        placeholder:text-secondary
        focus:outline-none
        focus:ring-2 focus:ring-[color:var(--accent-soft)]
        focus:border-[color:var(--accent)]
        transition-all
      "
    />

  );

}