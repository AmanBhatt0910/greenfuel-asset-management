// components/Navbar.jsx
import { Bell } from "lucide-react";

export default function Navbar() {
  return (
    <div className="w-full h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white">
          <Bell size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold cursor-pointer">
          A
        </div>
      </div>
    </div>
  );
}
