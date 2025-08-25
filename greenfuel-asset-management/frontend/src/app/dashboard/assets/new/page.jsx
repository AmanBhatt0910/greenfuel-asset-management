"use client";
import { motion } from "framer-motion";

export default function AssetRegistration() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold mb-6 text-green-400">New Asset Registration</h2>

      <form className="space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-300">Asset Code</label>
            <input type="text" placeholder="GF001" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Asset Make</label>
            <input type="text" placeholder="Dell" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Asset Model</label>
            <input type="text" placeholder="Latitude 3420" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Serial No*</label>
            <input type="text" placeholder="SN12345" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">PO No</label>
            <input type="text" placeholder="PO12345" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Invoice No</label>
            <input type="text" placeholder="INV12345" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Invoice Date</label>
            <input type="date" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Amount</label>
            <input type="number" placeholder="50000" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Vendor</label>
            <input type="text" placeholder="Vendor Name" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Warranty</label>
            <input type="text" placeholder="3 Years" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Warranty Start Date</label>
            <input type="date" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-gray-300">Warranty End Date</label>
            <input type="date" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          type="submit"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition-all"
        >
          Register Asset
        </motion.button>
      </form>
    </motion.div>
  );
}
