// app/dashboard/transfers/new/page.jsx
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

export default function AssetTransferRequest() {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">Asset Transfer Request</h2>

      <form className="space-y-10">
        {/* Asset Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Asset Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Asset Code" placeholder="GF001" />
            <FormInput label="Serial Number" placeholder="SN12345" />
            <FormInput label="Make/Model" placeholder="Dell Latitude 3420" />
            <FormInput label="Current Holder" placeholder="Employee Name" />
          </div>
        </div>

        {/* Transfer From */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Transfer From</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Employee Name" placeholder="Amit Sharma" />
            <FormInput label="Emp Code" placeholder="E102" />
            <FormSelect
              label="Department"
              options={["IT", "HR", "Finance", "Operations", "Sales", "Marketing", "Quality", "Admin"]}
            />
            <FormSelect
              label="Division"
              options={["CNG", "BATTERY", "INDORE", "CORPORATE", "GUJARAT"]}
            />
            <FormInput label="Location" placeholder="Current Location" />
          </div>
        </div>

        {/* Transfer To */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Transfer To</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Employee Name" placeholder="Priya Singh" />
            <FormInput label="Emp Code" placeholder="E203" />
            <FormSelect
              label="Department"
              options={["IT", "HR", "Finance", "Operations", "Sales", "Marketing", "Quality", "Admin"]}
            />
            <FormSelect
              label="Division"
              options={["CNG", "BATTERY", "INDORE", "CORPORATE", "GUJARAT"]}
            />
            <FormInput label="Location" placeholder="New Location" />
          </div>
        </div>

        {/* Reason & Remarks */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Reason for Transfer</h3>
          <FormInput label="Remarks" placeholder="Reason for transfer..." />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition-all"
          >
            Submit Transfer Request
          </button>
        </div>
      </form>
    </div>
  );
}
