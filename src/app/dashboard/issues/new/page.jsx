// app/dashboard/issue/new/page.jsx

"use client";
import { useEffect, useState } from "react";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

export default function NewAssetIssueForm() {
  const [formId, setFormId] = useState("");
  const [today, setToday] = useState("");
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAssetCode, setSelectedAssetCode] = useState("");
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const now = new Date();
    const datePart = now.toISOString().split("T")[0].replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    setFormId(`GF-IT-${datePart}-${randomPart}`);
    setToday(now.toISOString().split("T")[0]);

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssetChange = (assetCode) => {
    setSelectedAssetCode(assetCode);
    const asset = assets.find((a) => a.asset_code === assetCode);
    setSelectedAsset(asset || null);
    handleChange("asset_code", assetCode);
    handleChange("make_model", asset ? `${asset.make} ${asset.model}` : "");
    handleChange("serial_no", asset?.serial_no || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create issue");

      alert("Issue created successfully!");
      setFormData({});
      setSelectedAsset(null);
      setSelectedAssetCode("");
    } catch (err) {
      console.error("Error creating issue:", err);
      alert("Failed to create issue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">
        IT Assets Issue / Undertaking Form
      </h2>

      <form className="space-y-10" onSubmit={handleSubmit}>
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput label="Form Code" value={formId} readOnly />
          <FormInput label="Date" type="date" value={today} readOnly />
        </div>

        {/* Employee Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Employee Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Name" placeholder="Employee Name" onChange={(e)=>handleChange("employee_name", e.target.value)} />
            <FormInput label="Employee Code" placeholder="E123" onChange={(e)=>handleChange("emp_code", e.target.value)} />
            <FormSelect label="Department" options={["IT","HR","Finance","Operations","Sales","Marketing","Quality","Admin"]} onChange={(e)=>handleChange("department", e.target.value)} />
            <FormSelect label="Division" options={["CNG","BATTERY","INDORE","CORPORATE","GUJARAT"]} onChange={(e)=>handleChange("division", e.target.value)} />
            <FormInput label="Designation" placeholder="Designation" onChange={(e)=>handleChange("designation", e.target.value)} />
            <FormInput label="Location" placeholder="Office Location" onChange={(e)=>handleChange("location", e.target.value)} />
            <FormInput label="Phone No" placeholder="Phone Number" onChange={(e)=>handleChange("phone", e.target.value)} />
            <FormInput label="HOD" placeholder="Head of Department" onChange={(e)=>handleChange("hod", e.target.value)} />
            <FormInput label="Email ID" type="email" placeholder="employee@greenfuel.com" onChange={(e)=>handleChange("email", e.target.value)} />
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
              value={selectedAssetCode}
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
            <FormInput label="IP Address" placeholder="192.168.1.10" onChange={(e)=>handleChange("ip_address", e.target.value)} />
          </div>
        </div>

        {/* Software & Config */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Software & Config Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect label="Operating System" options={["Windows 11", "Windows 10", "Linux"]} onChange={(e)=>handleChange("os_software", e.target.value)} />
            <FormInput label="Microsoft Office" placeholder="Version Installed" onChange={(e)=>handleChange("office_version", e.target.value)} />
            <FormSelect label="Antivirus Installed" options={["Yes", "No"]} onChange={(e)=>handleChange("antivirus", e.target.value)} />
            <FormSelect label="Backup Configured" options={["Yes", "No"]} onChange={(e)=>handleChange("backup", e.target.value)} />
            <FormSelect label="Chrome Installed" options={["Yes", "No"]} onChange={(e)=>handleChange("chrome", e.target.value)} />
            <FormSelect label="OneDrive Configured" options={["Yes", "No"]} onChange={(e)=>handleChange("onedrive", e.target.value)} />
            <FormSelect label="RMM Agent Installed" options={["Yes", "No"]} onChange={(e)=>handleChange("rmm_agent", e.target.value)} />
          </div>
        </div>

        {/* Policy */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-400">Policy Declaration</h3>
          <p className="text-gray-300 text-sm mb-4">
            I acknowledge receipt of the assets mentioned above and agree that
            the IT assets and software installed will be used for Company
            purposes only. I will not load any additional software. If any
            software is found at the time of audit, I will take full
            responsibility for legal issues and commercial damages.
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-green-500"
              onChange={(e)=>handleChange("terms", e.target.checked ? "agreed" : null)}
            />
            <span className="text-sm text-gray-300">I agree to the terms & conditions</span>
          </label>
        </div>

        {/* Additional Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Hostname" placeholder="HOST-1234" onChange={(e)=>handleChange("hostname", e.target.value)} />
            <FormInput label="Old Laptop Serial No" placeholder="Old SN" onChange={(e)=>handleChange("old_serial", e.target.value)} />
          </div>
          <FormInput label="User Remarks" placeholder="Any remarks..." onChange={(e)=>handleChange("remarks", e.target.value)} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Issue Asset"}
          </button>
        </div>
      </form>
    </div>
  );
}
