// src/app/dashboard/assets/page.jsx

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
        const res = await fetch("/api/assets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRows(data);
        setState({ loading: false, error: "" });
      } catch {
        setState({ loading: false, error: "Failed to load assets" });
      }
    };
    run();
  }, []);

  if (state.loading) return <p className="text-gray-400">Loading assets…</p>;
  if (state.error) return <p className="text-red-400">{state.error}</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-white">Asset Inventory</h2>
        <p className="text-gray-400 text-sm">
          View and manage all registered assets
        </p>
      </div>

      <div className="overflow-x-auto bg-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300 text-xs uppercase">
            <tr>
              {[
                "Asset Code",
                "Make",
                "Model",
                "Serial No",
                "Invoice Date",
                "Amount",
                "Vendor",
                "Warranty",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-6 py-4 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <motion.tr
                key={r.id}
                whileHover={{ backgroundColor: "rgba(16,185,129,0.06)" }}
                className="border-t border-gray-800"
              >
                <td className="px-6 py-4 font-medium">{r.asset_code}</td>
                <td className="px-6 py-4">{r.make}</td>
                <td className="px-6 py-4">{r.model}</td>
                <td className="px-6 py-4">{r.serial_no}</td>
                <td className="px-6 py-4">{r.invoice_date?.slice(0, 10) || "-"}</td>
                <td className="px-6 py-4">
                  {r.amount ? `₹${Number(r.amount).toLocaleString()}` : "-"}
                </td>
                <td className="px-6 py-4">{r.vendor || "-"}</td>
                <td className="px-6 py-4">{r.warranty_years ?? "-"}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/dashboard/assets/${r.id}?mode=view`)
                    }
                    className="px-3 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white flex items-center gap-1"
                  >
                    <Eye size={14} /> View
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/dashboard/assets/${r.id}?mode=edit`)
                    }
                    className="px-3 py-1 rounded-lg bg-green-600/90 hover:bg-green-600 text-white flex items-center gap-1"
                  >
                    <Edit size={14} /> Edit
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
