// src/app/dashboard/software/[id]/page.jsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Save,
  ShieldCheck,
  Layers,
  Package,
  Monitor
} from "lucide-react";

export default function SoftwareDetailPage() {

  const router = useRouter();
  const { id } = useParams();
  const search = useSearchParams();
  const isEdit = search.get("mode") === "edit";
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

  useEffect(() => {

    Promise.all([
      fetch(`/api/software/${id}`, { credentials: "include" }),
      fetch(`/api/software/${id}/assets`, { credentials: "include" })
    ])
    .then(async ([softwareRes, assetsRes]) => {

      if (softwareRes.status === 401)
        window.location.href = "/";

      const softwareData = await softwareRes.json();
      const assetsData = await assetsRes.json();

      setForm(softwareData);
      setAssets(assetsData);

    })
    .finally(() => {
      setLoading(false);
      setAssetsLoading(false);
    });

  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-secondary">
          Loading software…
        </div>
      </div>
    );

  const onChange = e =>
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  const save = async () => {

    setSaving(true);
    setMsg("");

    try {

      const res = await fetch(`/api/software/${id}`, {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify(form)

      });

      if (res.ok)
        setMsg("Software updated successfully");
      else
        setMsg("Failed to update software");

    } catch {

      setMsg("Server error");

    } finally {

      setSaving(false);

    }

  };

  const usage =
  form.seats_total
    ? Math.round((form.seats_used / form.seats_total) * 100)
    : 0;

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
            Software {isEdit ? "Edit" : "Details"}
          </h2>

          <span className="
            inline-flex items-center gap-2 mt-2
            text-xs px-3 py-1 rounded-full
            accent-bg accent border-default
          ">
            <Package size={14}/>
            {form.name}
          </span>

        </div>

        <div className="flex gap-3">

          <button
            onClick={() => router.push("/dashboard/software")}
            className="
              px-4 py-2 rounded-xl
              surface-muted border-default
              text-secondary flex items-center gap-2
            "
          >
            <ArrowLeft size={16}/>
            Back
          </button>

          {!isEdit && (
            <>
              <button
              onClick={() =>
                router.push(
                  `/dashboard/software/${id}?mode=edit`
                )
              }
              className="
              px-4 py-2 rounded-xl
              accent-bg accent-strong
              border-default flex gap-2 items-center
              "
              >
                <Edit size={16}/>
                Edit
              </button>


              <button
                onClick={() =>
                  router.push(`/dashboard/software/${id}/assets`)
                }
                className="
                  px-4 py-2 rounded-xl
                  surface border-default
                  text-secondary flex gap-2 items-center
                "
              >
                <Layers size={16}/>
                Installed Assets
              </button>
            </>
          )}

        </div>

      </div>

      {/* License Overview */}
      <div className="
        surface border-default rounded-2xl p-6
      ">

        <div className="flex items-center gap-2 mb-3">

          <ShieldCheck className="accent"/>

          <h3 className="font-semibold text-primary">
            License Usage
          </h3>

        </div>

        <div className="flex justify-between text-sm mb-2">

          <span>
            {form.seats_used}/{form.seats_total} seats used
          </span>

          <span>
            {usage}%
          </span>

        </div>

        <div className="w-full h-3 surface-muted rounded-full">

          <div
            className="
              h-3 rounded-full bg-[var(--accent)]
            "
            style={{ width: `${usage}%` }}
          />

        </div>

      </div>

      {/* Details */}
      <div className="
        surface border-default rounded-2xl p-6
        grid grid-cols-1 md:grid-cols-2 gap-6
      ">

        <Field
          label="Software Name"
          name="name"
          value={form.name}
          disabled={!isEdit}
          onChange={onChange}
        />

        <Field
          label="Version"
          name="version"
          value={form.version}
          disabled={!isEdit}
          onChange={onChange}
        />

        <Field
          label="Vendor"
          name="vendor"
          value={form.vendor}
          disabled={!isEdit}
          onChange={onChange}
        />

        <Field
          label="License Type"
          name="license_type"
          value={form.license_type}
          disabled={!isEdit}
          onChange={onChange}
        />

        <Field
          label="Total Seats"
          name="seats_total"
          value={form.seats_total}
          disabled={!isEdit}
          onChange={onChange}
        />

        <Field
          label="Seats Used"
          name="seats_used"
          value={form.seats_used}
          disabled
        />

      </div>

      {/* Installed Assets */}
      <div className="surface border-default rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Layers className="accent"/>
            <h3 className="font-semibold text-primary">
              Installed Assets ({assets.length})
            </h3>
          </div>
          {assets.length > 0 && (
            <button
              onClick={() =>
                router.push(`/dashboard/software/${id}/assets`)
              }
              className="
                text-sm accent-bg accent px-3 py-1 rounded-lg
                hover:opacity-90
              "
            >
              View All
            </button>
          )}

        </div>
        {assetsLoading ? (
          <div className="text-secondary text-sm">
            Loading assets...
          </div>
        ) : assets.length === 0 ? (
          <div className="text-secondary text-sm">
            No assets using this software
          </div>
        ) : (
          <div className="grid gap-3">
            {assets.slice(0, 5).map(asset => (
              <div
                key={asset.assignment_id}
                className="
                  flex justify-between items-center
                  surface-muted border-default
                  rounded-xl p-3
                "
              >
                <div>
                  <div className="flex items-center gap-2 font-medium text-primary">
                    <Monitor size={16}/>
                    {asset.asset_code}
                  </div>
                  <div className="text-xs text-secondary">
                    {asset.make} {asset.model}
                  </div>
                </div>
                <button
                  onClick={() =>
                    router.push(`/dashboard/assets/${asset.asset_id}`)
                  }
                  className="
                    text-xs px-3 py-1 rounded-lg
                    accent-bg accent hover:opacity-90
                  "
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Save */}
      {isEdit && (

        <div className="flex justify-end">

          <button
            onClick={save}
            disabled={saving}
            className="
              px-6 py-3 rounded-xl
              accent-strong text-primary
              font-semibold flex gap-2 items-center
              shadow-lg disabled:opacity-50
            "
          >
            <Save size={16}/>
            {saving ? "Saving…" : "Save Changes"}
          </button>

        </div>

      )}

      {/* Message */}
      {msg && (

        <div className="
          px-4 py-3 rounded-xl text-sm
          accent-bg accent border-default
        ">
          {msg}
        </div>

      )}

    </motion.div>

  );

}


/* Field Component */

function Field({
  label,
  name,
  value,
  disabled,
  onChange
}) {

  return (

    <div className="space-y-1">

      <label className="text-xs text-secondary">
        {label}
      </label>

      <input
        name={name}
        value={value || ""}
        disabled={disabled}
        onChange={onChange}
        className={`
          w-full px-4 py-2 rounded-xl text-sm
          border-default transition
          ${
            disabled
              ? "surface-muted text-secondary"
              : "surface focus:ring-2 focus:ring-accent-soft"
          }
        `}
      />

    </div>

  );

}