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

  // Generate form code + fetch assets
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

  const handleChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const handleAssetChange = (assetCode) => {
    setSelectedAssetCode(assetCode);
    const asset = assets.find((a) => a.asset_code === assetCode);
    setSelectedAsset(asset || null);
    handleChange("asset_code", assetCode);
    handleChange("make_model", `${asset?.make || ""} ${asset?.model || ""}`);
    handleChange("serial_no", asset?.serial_no || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/post", {
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
            <FormInput label="employee_name" placeholder="Employee Name" onChange={(e)=>handleChange("employee_name", e.target.value)} />
            <FormInput label="emp_code" placeholder="E123" onChange={(e)=>handleChange("emp_code", e.target.value)} />
            <FormSelect label="department" options={["IT","HR","Finance","Operations","Sales","Marketing","Quality","Admin"]} onChange={(e)=>handleChange("department", e.target.value)} />
            <FormSelect label="division" options={["CNG","BATTERY","INDORE","CORPORATE","GUJARAT"]} onChange={(e)=>handleChange("division", e.target.value)} />
            <FormInput label="designation" placeholder="Designation" onChange={(e)=>handleChange("designation", e.target.value)} />
            <FormInput label="location" placeholder="Office Location" onChange={(e)=>handleChange("location", e.target.value)} />
            <FormInput label="phone" placeholder="Phone Number" onChange={(e)=>handleChange("phone", e.target.value)} />
            <FormInput label="hod" placeholder="Head of Department" onChange={(e)=>handleChange("hod", e.target.value)} />
            <FormInput label="email" type="email" placeholder="employee@greenfuel.com" onChange={(e)=>handleChange("email", e.target.value)} />
          </div>
        </div>

        {/* Asset Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Asset Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="asset_code"
              options={assets.map((a) => a.asset_code)}
              value={selectedAssetCode}
              onChange={(e) => handleAssetChange(e.target.value)}
            />
            <FormInput label="make_model" value={selectedAsset?.make || ""} readOnly />
            <FormInput label="serial_no" value={selectedAsset?.serial_no || ""} readOnly />
            <FormInput label="ip_address" placeholder="192.168.1.10" onChange={(e)=>handleChange("ip_address", e.target.value)} />
          </div>
        </div>

        {/* Software & Config */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Software & Config Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect label="os_software" options={["Windows 11","Windows 10","Linux"]} onChange={(e)=>handleChange("os_software", e.target.value)} />
            <FormInput label="remarks" placeholder="Any remarks..." onChange={(e)=>handleChange("remarks", e.target.value)} />
          </div>
        </div>

        {/* Policy */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-400">Policy Declaration</h3>
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
            <FormInput label="hostname" placeholder="HOST-1234" onChange={(e)=>handleChange("hostname", e.target.value)} />
            <FormInput label="old_serial" placeholder="Old Laptop SN" onChange={(e)=>handleChange("old_serial", e.target.value)} />
          </div>
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
