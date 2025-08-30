"use client";
import { useEffect, useState } from "react";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

export default function AssetTransferRequest() {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAssetCode, setSelectedAssetCode] = useState("");
  const [formData, setFormData] = useState({
    asset_code: "",
    serial_no: "",
    make_model: "",
    from_emp_name: "",
    from_emp_code: "",
    from_department: "",
    from_division: "",
    from_location: "",
    to_emp_name: "",
    to_emp_code: "",
    to_department: "",
    to_division: "",
    to_location: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch assets on mount
  useEffect(() => {
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

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // When asset is selected, populate details
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
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_emp_code: formData.from_emp_code,
          to_emp_code: formData.to_emp_code,
          asset_code: formData.asset_code,
          transfer_date: new Date().toISOString().split("T")[0],
          status: "Pending",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create transfer");
      }

      setMessage("✅ Transfer request submitted successfully!");
      setFormData({
        asset_code: "",
        serial_no: "",
        make_model: "",
        from_emp_name: "",
        from_emp_code: "",
        from_department: "",
        from_division: "",
        from_location: "",
        to_emp_name: "",
        to_emp_code: "",
        to_department: "",
        to_division: "",
        to_location: "",
        remarks: "",
      });
      setSelectedAsset(null);
      setSelectedAssetCode("");
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">Asset Transfer Request</h2>

      <form onSubmit={handleSubmit} className="space-y-10">
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
            <FormInput
              label="Make/Model"
              value={formData.make_model}
              readOnly
            />
            <FormInput
              label="Serial Number"
              value={formData.serial_no}
              readOnly
            />
          </div>
        </div>

        {/* Transfer From */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Transfer From
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Employee Name"
              value={formData.from_emp_name}
              onChange={(e) => handleChange("from_emp_name", e.target.value)}
            />
            <FormInput
              label="Emp Code"
              value={formData.from_emp_code}
              onChange={(e) => handleChange("from_emp_code", e.target.value)}
            />
            <FormSelect
              label="Department"
              value={formData.from_department}
              onChange={(e) => handleChange("from_department", e.target.value)}
              options={[
                "IT","HR","Finance","Operations","Sales",
                "Marketing","Quality","Admin",
              ]}
            />
            <FormSelect
              label="Division"
              value={formData.from_division}
              onChange={(e) => handleChange("from_division", e.target.value)}
              options={[
                "CNG","BATTERY","INDORE","CORPORATE","GUJARAT",
              ]}
            />
            <FormInput
              label="Location"
              value={formData.from_location}
              onChange={(e) => handleChange("from_location", e.target.value)}
            />
          </div>
        </div>

        {/* Transfer To */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Transfer To
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Employee Name"
              value={formData.to_emp_name}
              onChange={(e) => handleChange("to_emp_name", e.target.value)}
            />
            <FormInput
              label="Emp Code"
              value={formData.to_emp_code}
              onChange={(e) => handleChange("to_emp_code", e.target.value)}
            />
            <FormSelect
              label="Department"
              value={formData.to_department}
              onChange={(e) => handleChange("to_department", e.target.value)}
              options={[
                "IT","HR","Finance","Operations","Sales",
                "Marketing","Quality","Admin",
              ]}
            />
            <FormSelect
              label="Division"
              value={formData.to_division}
              onChange={(e) => handleChange("to_division", e.target.value)}
              options={[
                "CNG","BATTERY","INDORE","CORPORATE","GUJARAT",
              ]}
            />
            <FormInput
              label="Location"
              value={formData.to_location}
              onChange={(e) => handleChange("to_location", e.target.value)}
            />
          </div>
        </div>

        {/* Reason & Remarks */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">
            Reason for Transfer
          </h3>
          <FormInput
            label="Remarks"
            value={formData.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Transfer Request"}
          </button>
        </div>

        {message && <p className="mt-4 text-sm">{message}</p>}
      </form>
    </div>
  );
}
