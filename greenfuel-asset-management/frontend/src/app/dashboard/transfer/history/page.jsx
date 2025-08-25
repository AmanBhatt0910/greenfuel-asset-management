// app/dashboard/transfers/history/page.jsx
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default function AssetTransferHistory() {
  const transfers = [
    {
      assetCode: "GF001",
      make: "Dell Latitude 3420",
      serial: "SN12345",
      from: "Amit Sharma (IT)",
      to: "Priya Singh (Finance)",
      date: "2025-08-20",
      status: "Approved",
    },
    {
      assetCode: "GF002",
      make: "HP EliteBook 840",
      serial: "SN67890",
      from: "Ravi Verma (Sales)",
      to: "Kiran Rao (Marketing)",
      date: "2025-08-21",
      status: "Pending",
    },
    {
      assetCode: "GF003",
      make: "Lenovo ThinkPad T14",
      serial: "SN99887",
      from: "Sunita Mehra (HR)",
      to: "Anil Kapoor (Operations)",
      date: "2025-08-23",
      status: "Rejected",
    },
  ];

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

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Asset Transfer History</h2>
        <input
          type="text"
          placeholder="Search transfers..."
          className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table */}
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
            {transfers.map((t, i) => (
              <tr
                key={i}
                className="border-b border-gray-700 hover:bg-gray-800 transition-all"
              >
                <td className="px-6 py-3">{t.assetCode}</td>
                <td className="px-6 py-3">{t.make}</td>
                <td className="px-6 py-3">{t.serial}</td>
                <td className="px-6 py-3">{t.from}</td>
                <td className="px-6 py-3">{t.to}</td>
                <td className="px-6 py-3">{t.date}</td>
                <td className={`px-6 py-3 font-semibold ${statusColors[t.status]}`}>
                  {statusIcons[t.status]} {t.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-6">
        <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700">
          Previous
        </button>
        <button className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Next
        </button>
      </div>
    </div>
  );
}
