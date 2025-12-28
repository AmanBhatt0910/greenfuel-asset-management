// src/app/dashboard/transfer/new/page.jsx

"use client";
import { useEffect, useState } from "react";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

export default function AssetTransferRequest() {
  const [issues, setIssues] = useState([]); // store asset issues instead of assets
  const [users, setUsers] = useState([]);
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

  // Only issued assets (issues table = issued assets)
  const issuedAssets = issues.filter(
    (i) => i.asset_code && i.emp_code
  );


  // Fetch issues (assets with employee details) + users on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch issues (used as assets here)
        const resIssues = await fetch("/api/issues", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataIssues = await resIssues.json();
        if (!resIssues.ok) throw new Error(dataIssues.message || "Failed to fetch issues");
        setIssues(dataIssues);

        // Fetch users (for transfer-to dropdown)
        const resUsers = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataUsers = await resUsers.json();
        if (!resUsers.ok) throw new Error(dataUsers.message || "Failed to fetch users");
        setUsers(dataUsers);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // When asset is selected, populate asset + "from employee" details from issue record
  const handleAssetChange = (assetCode) => {
    setSelectedAssetCode(assetCode);
    const issue = issuedAssets.find((i) => i.asset_code === assetCode);
    if (!issue) return;

    // Fill asset details
    handleChange("asset_code", issue.asset_code);
    handleChange("make_model", issue.make_model || "");
    handleChange("serial_no", issue.serial_no || "");

    // Fill "from employee" details
    handleChange("from_emp_code", issue.emp_code || "");
    handleChange("from_emp_name", issue.employee_name || "");
    handleChange("from_department", issue.department || "");
    handleChange("from_division", issue.division || "");
    handleChange("from_location", issue.location || "");
  };

  // When "to employee" is selected, populate their details
  const handleUserChange = (empCode) => {
    const user = users.find((u) => u.emp_code === empCode);
    if (!user) return;

    handleChange("to_emp_code", user.emp_code);
    handleChange("to_emp_name", user.employee_name);
    handleChange("to_department", user.department || "");
    handleChange("to_division", user.division || "");
    handleChange("to_location", user.location || "");
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

      setMessage("Transfer request submitted successfully!");
      // Reset form
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
      setSelectedAssetCode("");
    } catch (err) {
      setMessage("Error: " + err.message);
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
          <h3 className="text-lg font-semibold mb-4 text-green-400">Asset Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Select Asset Code"
              options={issuedAssets.map((i) => ({
                label: `${i.asset_code} - ${i.make_model || ""} (${i.employee_name})`,
                value: i.asset_code,
              }))}
              value={selectedAssetCode}
              onChange={(e) => handleAssetChange(e.target.value)}
            />
            <FormInput label="Make/Model" value={formData.make_model} readOnly />
            <FormInput label="Serial Number" value={formData.serial_no} readOnly />
          </div>
        </div>

        {/* Transfer From (auto-filled) */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Transfer From</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Employee Name" value={formData.from_emp_name} readOnly />
            <FormInput label="Emp Code" value={formData.from_emp_code} readOnly />
            <FormInput label="Department" value={formData.from_department} readOnly />
            <FormInput label="Division" value={formData.from_division} readOnly />
            <FormInput label="Location" value={formData.from_location} readOnly />
          </div>
        </div>

        {/* Transfer To */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Transfer To</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Select Employee"
              options={users
                .filter((u) => u.emp_code !== formData.from_emp_code) // exclude "from" person
                .map((u) => ({
                  label: u.employee_name,
                  value: u.emp_code,
                }))}
              value={formData.to_emp_code}
              onChange={(e) => handleUserChange(e.target.value)}
            />
            <FormInput label="Employee Name" value={formData.to_emp_name} readOnly />
            <FormInput label="Emp Code" value={formData.to_emp_code} readOnly />
            <FormInput label="Department" value={formData.to_department} readOnly />
            <FormInput label="Division" value={formData.to_division} readOnly />
            <FormInput label="Location" value={formData.to_location} readOnly />
          </div>
        </div>

        {/* Reason & Remarks */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-400">Reason for Transfer</h3>
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
