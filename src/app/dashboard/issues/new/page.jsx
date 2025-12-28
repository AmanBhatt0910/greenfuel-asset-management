// app/dashboard/issue/new/page.jsx

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

export default function NewAssetIssueForm() {
  const router = useRouter();
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
      const token = localStorage.getItem("token");
      const res = await fetch("/api/assets?available=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const availableAssets = Array.isArray(data)
        ? data.filter((a) => a.status === "IN_STOCK")
        : [];

      setAssets(availableAssets);
    };
    fetchAssets();
  }, []);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

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

    if (!formData.asset_code) {
      alert("Please select an asset");
      return;
    }

    if (!formData.employee_name || !formData.emp_code) {
      alert("Employee details are required");
      return;
    }

    if (formData.terms !== "agreed") {
      alert("You must agree to terms & conditions");
      return;
    }

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

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to create issue");
      }

      router.push("/dashboard/issues");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Issue IT Asset
          </h2>
          <p className="text-sm text-gray-400">
            Asset Issue / Undertaking Form
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta */}
        <section className="bg-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput label="Form Code" value={formId} readOnly />
            <FormInput label="Date" type="date" value={today} readOnly />
          </div>
        </section>

        {/* Employee */}
        <section className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4">
            Employee Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Employee Name"
              value={formData.employee_name || ""}
              onChange={(e) => handleChange("employee_name", e.target.value)}
            />

            <FormInput
              label="Employee Code"
              value={formData.emp_code || ""}
              onChange={(e) => handleChange("emp_code", e.target.value)}
            />
            <FormSelect
              label="Department"
              value={formData.department || ""}
              options={["IT","HR","Finance","Operations","Sales","Admin"]}
              onChange={(e) => handleChange("department", e.target.value)}
            />
            <FormSelect
              label="Division"
              value={formData.division || ""}
              options={["CNG","BATTERY","CORPORATE","GUJARAT"]}
              onChange={(e) => handleChange("division", e.target.value)}
            />
            <FormInput
              label="Designation"
              value={formData.designation || ""}
              onChange={(e) => handleChange("designation", e.target.value)}
            />
            <FormInput
              label="Location"
              value={formData.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
            />
            <FormInput
              label="Phone"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <FormInput
              label="Email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
        </section>

        {/* Asset */}
        <section className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4">
            Asset Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Asset Code"
              options={assets.map((a) => a.asset_code)}
              value={selectedAssetCode}
              disabled={assets.length === 0}
              onChange={(e) => handleAssetChange(e.target.value)}
            />

            <FormInput label="Make" value={selectedAsset?.make || ""} readOnly />
            <FormInput label="Model" value={selectedAsset?.model || ""} readOnly />
            <FormInput label="Serial No" value={selectedAsset?.serial_no || ""} readOnly />
            <FormInput
              label="IP Address"
              value={formData.ip_address || ""}
              onChange={(e) => handleChange("ip_address", e.target.value)}
            />

          </div>
        </section>

        {/* System Configuration */}
          <section className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              System Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Operating System / Software"
                placeholder="Windows 11, MS Office 2021, Antivirus"
                value={formData.os_software || ""}
                onChange={(e) => handleChange("os_software", e.target.value)}
              />

              <FormInput
                label="Hostname"
                placeholder="GF-LAP-023"
                value={formData.hostname || ""}
                onChange={(e) => handleChange("hostname", e.target.value)}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Configuration details at the time of asset issue.
            </p>
          </section>


        {/* Policy */}
        <section className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-3">
            Declaration
          </h3>
          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            I acknowledge receipt of the IT assets and agree to use them strictly
            for company purposes.
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              className="accent-green-500"
              onChange={(e) =>
                handleChange("terms", e.target.checked ? "agreed" : "")
              }
            />
            I agree to the terms & conditions
          </label>
        </section>

        {/* OS & Software Details */}
          <section className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              Operating Systems & Software Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Operating System Name"
                placeholder="Windows"
                value={formData.os_name || ""}
                onChange={(e) => handleChange("os_name", e.target.value)}
              />

              <FormInput
                label="OS Version"
                placeholder="11 Pro"
                value={formData.os_version || ""}
                onChange={(e) => handleChange("os_version", e.target.value)}
              />

              <FormInput
                label="Microsoft Office Version"
                placeholder="Office 2021"
                value={formData.office_version || ""}
                onChange={(e) => handleChange("office_version", e.target.value)}
              />

              <FormInput
                label="Antivirus"
                placeholder="Sophos"
                value={formData.antivirus || ""}
                onChange={(e) => handleChange("antivirus", e.target.value)}
              />

              <FormSelect
                label="Windows Update"
                options={["YES", "NO"]}
                value={formData.windows_update || "YES"}
                onChange={(e) => handleChange("windows_update", e.target.value)}
              />

              <FormSelect
                label="Local Admin Removed"
                options={["YES", "NO"]}
                value={formData.local_admin_removed || "YES"}
                onChange={(e) => handleChange("local_admin_removed", e.target.value)}
              />

              <FormSelect
                label="Printer Configured"
                options={["YES", "NO"]}
                value={formData.printer_configured || "YES"}
                onChange={(e) => handleChange("printer_configured", e.target.value)}
              />

              <FormSelect
                label="SAP Installed"
                options={["YES", "NO"]}
                value={formData.sap || "NO"}
                onChange={(e) => handleChange("sap", e.target.value)}
              />

              <FormSelect
                label="Backup Configured"
                options={["YES", "NO"]}
                value={formData.backup_configured || "NO"}
                onChange={(e) => handleChange("backup_configured", e.target.value)}
              />

              <FormSelect
                label="7-Zip Installed"
                options={["YES", "NO"]}
                value={formData.zip_7 || "YES"}
                onChange={(e) => handleChange("zip_7", e.target.value)}
              />

              <FormSelect
                label="Chrome Installed"
                options={["YES", "NO"]}
                value={formData.chrome || "YES"}
                onChange={(e) => handleChange("chrome", e.target.value)}
              />

              <FormSelect
                label="OneDrive Configured"
                options={["YES", "NO"]}
                value={formData.onedrive || "YES"}
                onChange={(e) => handleChange("onedrive", e.target.value)}
              />

              <FormSelect
                label="Laptop Bag Provided"
                options={["YES", "NO"]}
                value={formData.laptop_bag || "YES"}
                onChange={(e) => handleChange("laptop_bag", e.target.value)}
              />

              <FormInput
                label="RMM Agent"
                placeholder="Kaseya / Intune"
                value={formData.rmm_agent || ""}
                onChange={(e) => handleChange("rmm_agent", e.target.value)}
              />

              <FormInput
                label="Physical Condition"
                placeholder="Good"
                value={formData.physical_condition || ""}
                onChange={(e) => handleChange("physical_condition", e.target.value)}
              />

              <FormInput
                label="Hostname"
                placeholder="GF-LAP-023"
                value={formData.hostname || ""}
                onChange={(e) => handleChange("hostname", e.target.value)}
              />
            </div>
          </section>


        {/* CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              submitting ||
              !formData.asset_code ||
              !formData.employee_name ||
              !formData.emp_code ||
              formData.terms !== "agreed"
            }
            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
          >

            <FileCheck size={18} />
            {submitting ? "Submitting..." : "Issue Asset"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
