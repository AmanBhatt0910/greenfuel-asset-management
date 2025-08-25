"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssetsPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setState({ loading: false, error: "Not authenticated. Please log in." });
          return;
        }
        const res = await fetch("/api/assets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch");
        setRows(data);
        setState({ loading: false, error: "" });
      } catch (e) {
        setState({ loading: false, error: e.message || "Error" });
      }
    };
    run();
  }, []);

  if (state.loading) return <div className="text-gray-300">Loading assets...</div>;
  if (state.error) return <div className="text-red-400">Error: {state.error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h2 className="text-2xl font-bold mb-6 text-green-400">Asset Inventory</h2>

      <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-700 shadow-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Asset Code</th>
              <th className="px-6 py-3">Make</th>
              <th className="px-6 py-3">Model</th>
              <th className="px-6 py-3">Serial No</th>
              <th className="px-6 py-3">Invoice Date</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Vendor</th>
              <th className="px-6 py-3">Warranty (Yrs)</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={r.id || i}
                whileHover={{ scale: 1.01, backgroundColor: "rgba(16,185,129,0.08)" }}
                transition={{ duration: 0.15 }}
                className="border-b border-gray-700"
              >
                <td className="px-6 py-3">{r.asset_code}</td>
                <td className="px-6 py-3">{r.make}</td>
                <td className="px-6 py-3">{r.model}</td>
                <td className="px-6 py-3">{r.serial_no}</td>
                <td className="px-6 py-3">{r.invoice_date?.slice(0, 10) || "-"}</td>
                <td className="px-6 py-3">{r.amount == null ? "-" : `₹${Number(r.amount).toLocaleString()}`}</td>
                <td className="px-6 py-3">{r.vendor || "-"}</td>
                <td className="px-6 py-3">{r.warranty_years ?? "-"}</td>
                <td className="px-6 py-3 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => router.push(`/dashboard/assets/${r.id}`)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-1"
                  >
                    <Eye size={16} /> View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => router.push(`/dashboard/assets/${r.id}`)}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-1"
                  >
                    <Edit size={16} /> Edit
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
