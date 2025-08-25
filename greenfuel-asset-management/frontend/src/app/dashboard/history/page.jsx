// app/dashboard/history/page.jsx
import { Package, ArrowRightLeft, Trash2, UserPlus } from "lucide-react";

export default function AssetHistory() {
  const history = [
    {
      type: "Registered",
      asset: "Dell Latitude 3420",
      assetCode: "GF001",
      user: "System",
      date: "2025-08-20",
      icon: <Package className="text-green-400" size={20} />,
    },
    {
      type: "Issued",
      asset: "HP EliteBook 840",
      assetCode: "GF002",
      user: "Issued to Amit Sharma (IT)",
      date: "2025-08-21",
      icon: <UserPlus className="text-blue-400" size={20} />,
    },
    {
      type: "Transferred",
      asset: "Lenovo ThinkPad T14",
      assetCode: "GF003",
      user: "From Ravi Verma (Sales) → Priya Singh (Finance)",
      date: "2025-08-22",
      icon: <ArrowRightLeft className="text-yellow-400" size={20} />,
    },
    {
      type: "Marked as Garbage",
      asset: "Old Printer HP 1020",
      assetCode: "GF004",
      user: "IT Admin",
      date: "2025-08-23",
      icon: <Trash2 className="text-red-400" size={20} />,
    },
  ];

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">All Asset History</h2>

      <div className="relative border-l border-gray-700 ml-4">
        {history.map((item, i) => (
          <div key={i} className="mb-10 ml-6">
            {/* Icon */}
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 border border-gray-700">
              {item.icon}
            </span>

            {/* Card */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-md border border-gray-700 hover:border-green-500 transition-all">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-green-400">
                  {item.type}
                </h3>
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
              <p className="text-sm text-gray-300 mt-1">{item.asset} ({item.assetCode})</p>
              <p className="text-sm text-gray-400 mt-1">{item.user}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
