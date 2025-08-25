"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id;

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAsset() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/assets/${assetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch asset");
        setForm(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setMsg({ type: "error", text: err.message });
        setLoading(false);
      }
    }
    fetchAsset();
  }, [assetId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/assets/${assetId}`, {
        method: "PUT",
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
      if (!res.ok) throw new Error(data.message || "Failed to update asset");
      setMsg({ type: "success", text: "Asset updated successfully!" });
      setSaving(false);
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: err.message });
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = "text", placeholder = "" }) => (
    <div>
      <label className="block text-gray-300 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={form[name] || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );

  if (loading) return <p className="text-gray-400">Loading asset details...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h2 className="text-2xl font-bold mb-6 text-green-400">Asset Details & Edit</h2>

      <form onSubmit={onSubmit} className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Asset Code*" name="asset_code" placeholder="GF-001" />
          <Field label="Asset Make" name="make" placeholder="Dell, HP" />
          <Field label="Asset Model" name="model" placeholder="Latitude 3420" />

          <Field label="Serial No*" name="serial_no" placeholder="SN-XXXX" />
          <Field label="PO No" name="po_no" placeholder="PO-1234" />
          <Field label="Invoice No" name="invoice_no" placeholder="INV-5678" />

          <Field label="Invoice Date" name="invoice_date" type="date" />
          <Field label="Amount" name="amount" type="number" placeholder="55000" />
          <Field label="Vendor" name="vendor" placeholder="Greenfuel Vendor" />

          <Field label="Warranty (Years)" name="warranty_years" type="number" placeholder="3" />
          <Field label="Warranty Start Date" name="warranty_start" type="date" />
          <Field label="Warranty End Date" name="warranty_end" type="date" />
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

        <div className="flex flex-wrap gap-4 mt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Asset"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => router.push("/dashboard/assets")}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold shadow-lg transition-all"
          >
            Back to Inventory
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
