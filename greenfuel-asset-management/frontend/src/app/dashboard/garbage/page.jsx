// app/dashboard/garbage/page.jsx
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import { Trash2 } from "lucide-react";

export default function MarkGarbage() {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trash2 size={24} className="text-red-400" /> Mark Asset as Garbage
      </h2>

      <form className="space-y-8">
        {/* Asset Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Asset Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Select Asset"
              options={["GF001 - Dell Latitude 3420", "GF002 - HP EliteBook 840", "GF003 - Lenovo ThinkPad T14"]}
            />
            <FormInput label="Serial Number" placeholder="Enter Serial Number" />
          </div>
        </div>

        {/* Reason for Garbage */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Reason</h3>
          <FormInput label="Remarks / Reason" placeholder="Enter reason why asset is marked as garbage" />
        </div>

        {/* Confirmation */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-red-500" />
            <span className="text-gray-300 text-sm">
              I confirm that this asset is permanently unusable and should be marked as garbage.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold shadow-lg transition-all"
          >
            Mark as Garbage
          </button>
        </div>
      </form>
    </div>
  );
}
