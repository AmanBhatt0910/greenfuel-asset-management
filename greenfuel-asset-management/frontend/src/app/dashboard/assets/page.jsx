"use client";
import { motion } from "framer-motion";

const assets = [
  { code: "GF001", make: "Dell", model: "Latitude 3420", serial: "SN12345", vendor: "Dell Vendor", status: "In Stock" },
  { code: "GF002", make: "HP", model: "EliteBook 840", serial: "SN54321", vendor: "HP Vendor", status: "Issued" },
  { code: "GF003", make: "Lenovo", model: "ThinkPad T14", serial: "SN67890", vendor: "Lenovo Vendor", status: "In Stock" },
];

export default function AssetInventory() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold mb-6 text-green-400">Asset Inventory</h2>

      <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-700 shadow-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Asset Code</th>
              <th className="px-6 py-3">Make</th>
              <th className="px-6 py-3">Model</th>
              <th className="px-6 py-3">Serial No</th>
              <th className="px-6 py-3">Vendor</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, i) => (
              <motion.tr
                key={i}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(16,185,129,0.1)" }}
                transition={{ duration: 0.2 }}
                className="border-b border-gray-700 cursor-pointer"
              >
                <td className="px-6 py-3">{asset.code}</td>
                <td className="px-6 py-3">{asset.make}</td>
                <td className="px-6 py-3">{asset.model}</td>
                <td className="px-6 py-3">{asset.serial}</td>
                <td className="px-6 py-3">{asset.vendor}</td>
                <td className={`px-6 py-3 font-semibold ${asset.status === "Issued" ? "text-blue-400" : "text-green-400"}`}>
                  {asset.status}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
