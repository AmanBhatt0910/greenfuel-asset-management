"use client";
import { useEffect, useState } from "react";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

export default function NewAssetIssueForm() {
  const [formId, setFormId] = useState("");
  const [today, setToday] = useState("");
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    // Generate unique Form ID once
    const now = new Date();
    const datePart = now.toISOString().split("T")[0].replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    setFormId(`GF-IT-F-03-${datePart}-${randomPart}`);
    setToday(now.toISOString().split("T")[0]);

    // Fetch assets
    const fetchAssets = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/assets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch assets");
        setAssets(data);
      } catch (err) {
        console.error("Error fetching assets:", err);
      }
    };
    fetchAssets();
  }, []);

  const handleAssetChange = (assetCode) => {
    const asset = assets.find((a) => a.asset_code === assetCode);
    setSelectedAsset(asset || null);
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">
        IT Assets Issue / Undertaking Form
      </h2>

      <form className="space-y-10">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput label="Form Code" value={formId} readOnly />
          <FormInput label="Date" type="date" value={today} readOnly />
        </div>

        {/* Employee Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Employee Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Name" placeholder="Employee Name" />
            <FormInput label="Employee Code" placeholder="E123" />
            <FormSelect
              label="Department"
              options={["IT","HR","Finance","Operations","Sales","Marketing","Quality","Admin"]}
            />
            <FormSelect
              label="Division"
              options={["CNG","BATTERY","INDORE","CORPORATE","GUJARAT"]}
            />
            <FormInput label="Designation" placeholder="Designation" />
            <FormInput label="Location" placeholder="Office Location" />
            <FormInput label="Phone No" placeholder="Phone Number" />
            <FormInput label="HOD" placeholder="Head of Department" />
            <FormInput label="Email ID" type="email" placeholder="employee@greenfuel.com" />
          </div>
        </div>

        {/* Asset Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Asset Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Select Asset Code"
              options={assets.map((a) => a.asset_code)}
              onChange={(e) => handleAssetChange(e.target.value)}
            />
            <FormInput label="Make" value={selectedAsset?.make || ""} readOnly />
            <FormInput label="Model" value={selectedAsset?.model || ""} readOnly />
            <FormInput label="Serial No" value={selectedAsset?.serial_no || ""} readOnly />
            <FormInput label="PO Number" value={selectedAsset?.po_no || ""} readOnly />
            <FormInput label="Invoice Number" value={selectedAsset?.invoice_no || ""} readOnly />
            <FormInput label="Invoice Date" value={selectedAsset?.invoice_date?.split("T")[0] || ""} readOnly />
            <FormInput label="Amount" value={selectedAsset?.amount || ""} readOnly />
            <FormInput label="Vendor" value={selectedAsset?.vendor || ""} readOnly />
            <FormInput label="Warranty (Years)" value={selectedAsset?.warranty_years || ""} readOnly />
            <FormInput label="Warranty Start" value={selectedAsset?.warranty_start?.split("T")[0] || ""} readOnly />
            <FormInput label="Warranty End" value={selectedAsset?.warranty_end?.split("T")[0] || ""} readOnly />
            <FormInput label="IP Address" placeholder="192.168.1.10" />
          </div>
        </div>

        {/* Software & Config Checklist */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Software & Config Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect label="Operating System" options={["Windows 11", "Windows 10", "Linux"]} />
            <FormInput label="Microsoft Office" placeholder="Version Installed" />
            <FormSelect label="Antivirus Installed" options={["Yes", "No"]} />
            <FormSelect label="Backup Configured" options={["Yes", "No"]} />
            <FormSelect label="Chrome Installed" options={["Yes", "No"]} />
            <FormSelect label="OneDrive Configured" options={["Yes", "No"]} />
            <FormSelect label="RMM Agent Installed" options={["Yes", "No"]} />
          </div>
        </div>

        {/* Policy Declaration */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Policy Declaration
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            I acknowledge receipt of the assets mentioned above and agree that
            the IT assets and software installed will be used for Company
            purposes only. I will not load any additional software. If any
            software is found at the time of audit, I will take full
            responsibility for legal issues and commercial damages.
          </p>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-300">I agree to the terms & conditions</span>
          </label>
        </div>

        {/* Additional Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Hostname" placeholder="HOST-1234" />
            <FormInput label="Old Laptop Serial No" placeholder="Old SN" />
          </div>
          <FormInput label="User Remarks" placeholder="Any remarks..." />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition-all"
          >
            Issue Asset
          </button>
        </div>
      </form>
    </div>
  );
}
