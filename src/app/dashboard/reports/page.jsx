// app/dashboard/reports/page.jsx
import { FileText, Download } from "lucide-react";

export default function Reports() {
  const reports = [
    { type: "All Assets", generatedOn: "2025-08-25", format: "PDF" },
    { type: "Issued Assets", generatedOn: "2025-08-25", format: "Excel" },
    { type: "Transfer History", generatedOn: "2025-08-25", format: "PDF" },
    { type: "Garbage Assets", generatedOn: "2025-08-25", format: "PDF" },
  ];

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">Reports</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <input
          type="date"
          className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
          <option>All Report Types</option>
          <option>All Assets</option>
          <option>Issued Assets</option>
          <option>Transfer History</option>
          <option>Garbage Assets</option>
        </select>
        <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center gap-2">
          <FileText size={16} /> Generate
        </button>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Report Type</th>
              <th className="px-6 py-3">Generated On</th>
              <th className="px-6 py-3">Format</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr
                key={i}
                className="border-b border-gray-700 hover:bg-gray-800 transition-all"
              >
                <td className="px-6 py-3">{r.type}</td>
                <td className="px-6 py-3">{r.generatedOn}</td>
                <td className="px-6 py-3">{r.format}</td>
                <td className="px-6 py-3 flex justify-end gap-3">
                  <button className="p-2 rounded-lg bg-green-600 hover:bg-green-700 flex items-center gap-1">
                    <Download size={16} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
