// app/dashboard/issues/page.jsx
import { Eye, RotateCcw } from "lucide-react";

export default function AssetIssuesList() {
  const issuedAssets = [
    {
      name: "Amit Sharma",
      empCode: "E102",
      department: "IT",
      assetCode: "GF001",
      make: "Dell",
      model: "Latitude 3420",
      serial: "SN12345",
      issueDate: "2025-08-10",
    },
    {
      name: "Priya Singh",
      empCode: "E203",
      department: "Finance",
      assetCode: "GF002",
      make: "HP",
      model: "EliteBook 840",
      serial: "SN67890",
      issueDate: "2025-08-15",
    },
  ];

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Existing Asset Issues</h2>
        <input
          type="text"
          placeholder="Search issued assets..."
          className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Employee Name</th>
              <th className="px-6 py-3">Emp Code</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Asset Code</th>
              <th className="px-6 py-3">Make/Model</th>
              <th className="px-6 py-3">Serial No</th>
              <th className="px-6 py-3">Issued Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issuedAssets.map((issue, i) => (
              <tr
                key={i}
                className="border-b border-gray-700 hover:bg-gray-800 transition-all"
              >
                <td className="px-6 py-3">{issue.name}</td>
                <td className="px-6 py-3">{issue.empCode}</td>
                <td className="px-6 py-3">{issue.department}</td>
                <td className="px-6 py-3">{issue.assetCode}</td>
                <td className="px-6 py-3">{issue.make} {issue.model}</td>
                <td className="px-6 py-3">{issue.serial}</td>
                <td className="px-6 py-3">{issue.issueDate}</td>
                <td className="px-6 py-3 flex justify-end gap-3">
                  <button className="p-2 rounded-lg bg-green-600 hover:bg-green-700">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 rounded-lg bg-yellow-600 hover:bg-yellow-700">
                    <RotateCcw size={16} />
                  </button>
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
