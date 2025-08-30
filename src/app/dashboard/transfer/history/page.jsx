"use client";
import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default function AssetTransferHistory() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTransfers() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/transfers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch transfers");

        const data = await res.json();
        setTransfers(data);
      } catch (err) {
        console.error("Failed to load transfers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransfers();
  }, []);

  const statusColors = {
    Approved: "text-green-400",
    Pending: "text-yellow-400",
    Rejected: "text-red-400",
  };

  const statusIcons = {
    Approved: <CheckCircle size={16} className="inline mr-1" />,
    Pending: <Clock size={16} className="inline mr-1" />,
    Rejected: <XCircle size={16} className="inline mr-1" />,
  };

  const filtered = transfers.filter(
    (t) =>
      t.asset_code?.toLowerCase().includes(search.toLowerCase()) ||
      t.make?.toLowerCase().includes(search.toLowerCase()) ||
      t.model?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Asset Transfer History</h2>
        <input
          type="text"
          placeholder="Search transfers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {loading ? (
        <p>Loading transfers...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Asset Code</th>
                <th className="px-6 py-3">Make/Model</th>
                <th className="px-6 py-3">Serial No</th>
                <th className="px-6 py-3">From</th>
                <th className="px-6 py-3">To</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-700 hover:bg-gray-800 transition-all"
                >
                  <td className="px-6 py-3">{t.asset_code}</td>
                  <td className="px-6 py-3">
                    {t.make} {t.model}
                  </td>
                  <td className="px-6 py-3">{t.serial_no}</td>
                  <td className="px-6 py-3">{t.from_emp_code}</td>
                  <td className="px-6 py-3">{t.to_emp_code}</td>
                  <td className="px-6 py-3">
                    {new Date(t.transfer_date).toLocaleDateString()}
                  </td>
                  <td
                    className={`px-6 py-3 font-semibold ${statusColors[t.status]}`}
                  >
                    {statusIcons[t.status]} {t.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
