// src/app/dashboard/transfer/new/page.jsx

// src/app/dashboard/transfer/new/page.jsx

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Send, AlertCircle } from "lucide-react";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

export default function AssetTransferRequest() {
  const [issues, setIssues] = useState([]);
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
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const issuedAssets = issues.filter((i) => i.asset_code && i.emp_code);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const resIssues = await fetch("/api/issues", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataIssues = await resIssues.json();
        if (!resIssues.ok) throw new Error(dataIssues.message || "Failed to fetch issues");
        setIssues(dataIssues);

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

  const handleAssetChange = (assetCode) => {
    setSelectedAssetCode(assetCode);
    const issue = issuedAssets.find((i) => i.asset_code === assetCode);
    if (!issue) return;

    handleChange("asset_code", issue.asset_code);
    handleChange("make_model", issue.make_model || "");
    handleChange("serial_no", issue.serial_no || "");
    handleChange("from_emp_code", issue.emp_code || "");
    handleChange("from_emp_name", issue.employee_name || "");
    handleChange("from_department", issue.department || "");
    handleChange("from_division", issue.division || "");
    handleChange("from_location", issue.location || "");
  };

  const handleUserChange = (empCode) => {
    const user = users.find((u) => u.emp_code === empCode);
    if (!user) return;

    handleChange("to_emp_code", user.emp_code);
    handleChange("to_emp_name", user.employee_name);
    handleChange("to_department", user.department || "");
    handleChange("to_division", user.division || "");
    handleChange("to_location", user.location || "");
  };

  const isFormValid =
    formData.asset_code &&
    formData.from_emp_code &&
    formData.to_emp_code &&
    formData.to_emp_code !== formData.from_emp_code;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setMessage("Please select asset and target employee before submitting.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

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
      setMessageType("success");
      
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
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
          <ArrowRightLeft className="accent" size={28} />
          Asset Transfer Request
        </h2>
        <p className="text-sm text-secondary mt-1">
          Transfer an asset from one employee to another
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset Details */}
        <section className="surface-card p-6">
          <h3 className="text-lg font-semibold accent mb-4">
            Asset Details
          </h3>
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
        </section>

        {/* Transfer From */}
        <section className="surface-card p-6">
          <h3 className="text-lg font-semibold accent mb-4">
            Transfer From
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Employee Name" value={formData.from_emp_name} readOnly />
            <FormInput label="Emp Code" value={formData.from_emp_code} readOnly />
            <FormInput label="Department" value={formData.from_department} readOnly />
            <FormInput label="Division" value={formData.from_division} readOnly />
            <FormInput label="Location" value={formData.from_location} readOnly />
          </div>
        </section>

        {/* Transfer To */}
        <section className="surface-card p-6">
          <h3 className="text-lg font-semibold accent mb-4">
            Transfer To
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Select Employee"
              options={users
                .filter((u) => u.emp_code !== formData.from_emp_code)
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
        </section>

        {/* Reason & Remarks */}
        <section className="surface-card p-6">
          <h3 className="text-lg font-semibold accent mb-4">
            Reason for Transfer
          </h3>
          <FormInput
            label="Remarks"
            value={formData.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
            placeholder="Optional: Provide reason for this transfer"
          />
        </section>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              surface-card p-4 flex items-start gap-3
              ${messageType === 'success' ? 'border-l-4 border-accent' : ''}
              ${messageType === 'error' ? 'border-l-4 border-danger' : ''}
            `}
          >
            <AlertCircle 
              size={20} 
              className={messageType === 'success' ? 'accent' : 'text-danger'} 
            />
            <p className={`text-sm ${messageType === 'success' ? 'text-primary' : 'text-danger'}`}>
              {message}
            </p>
          </motion.div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`
              px-6 py-3 rounded-xl font-semibold shadow-lg
              gradient-accent text-white
              hover:opacity-90 transition-opacity
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <Send size={18} />
            {loading ? "Submitting..." : "Submit Transfer Request"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}