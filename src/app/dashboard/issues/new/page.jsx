// app/dashboard/issues/new/page.jsx
"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/FormInput";
import FormSelectSearchable from "@/components/FormSelectSearchable";

/* ============================
   Reusable Components
============================ */

// Page Header Component
const PageHeader = ({ title, subtitle, onBack }) => (
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-3xl font-bold text-primary">{title}</h2>
      <p className="text-sm text-secondary">{subtitle}</p>
    </div>
    <button
      onClick={onBack}
      className="px-4 py-2 rounded-xl surface border-default hover:surface-muted transition-colors flex items-center gap-2"
    >
      <ArrowLeft size={16} /> Back
    </button>
  </div>
);

// Form Section Component
const FormSection = ({ title, children, note }) => (
  <section className="surface-card p-6">
    {title && <h3 className="text-lg font-semibold accent mb-4">{title}</h3>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    {note && <p className="text-xs text-secondary mt-2">{note}</p>}
  </section>
);

// Declaration Section Component
const DeclarationSection = ({ onChange, checked }) => (
  <section className="surface-card p-6">
    <h3 className="text-lg font-semibold accent mb-3">Declaration</h3>
    <p className="text-sm text-primary mb-4 leading-relaxed">
      I acknowledge receipt of the IT assets and agree to use them strictly for
      company purposes.
    </p>
    <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
      <input
        type="checkbox"
        className="w-4 h-4 cursor-pointer"
        checked={checked}
        onChange={(e) => onChange("terms", e.target.checked ? "agreed" : "")}
      />
      I agree to the terms & conditions
    </label>
  </section>
);

// Submit Button Component
const SubmitButton = ({ disabled, submitting }) => (
  <div className="flex justify-end">
    <button
      type="submit"
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-semibold 
        flex items-center gap-2 shadow-lg
        gradient-accent text-white
        hover:opacity-90 transition-opacity
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <FileCheck size={18} />
      {submitting ? "Submitting..." : "Issue Asset"}
    </button>
  </div>
);

/* ============================
   Form Field Builder
============================ */
const FieldBuilder = ({ field, formData, handleChange, assets, selectedAssetCode, handleAssetChange }) => {
  const commonProps = {
    label: field.label,
    value: formData[field.name] || field.defaultValue || "",
    placeholder: field.placeholder,
  };

  // Special handling for asset selection
  if (field.name === "asset_code") {
    const assetOptions = assets.map((a) => ({
      value: a.asset_code,
      label: `${a.asset_code} - ${a.make} ${a.model} (${a.serial_no})`,
    }));

    return (
      <FormSelectSearchable
        {...commonProps}
        options={assetOptions}
        value={selectedAssetCode}
        disabled={assets.length === 0}
        onChange={(e) => handleAssetChange(e.target.value)}
        searchPlaceholder="Type to search assets..."
      />
    );
  }

  // Select fields with options
  if (field.type === "select" && field.options) {
    return (
      <FormSelectSearchable
        {...commonProps}
        options={field.options}
        onChange={(e) => handleChange(field.name, e.target.value)}
        searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
      />
    );
  }

  // Regular input fields
  return (
    <FormInput
      {...commonProps}
      type={field.type || "text"}
      readOnly={field.readOnly}
      onChange={field.readOnly ? undefined : (e) => handleChange(field.name, e.target.value)}
    />
  );
};

/* ============================
   Main Component
============================ */
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
      try {
        const res = await fetch("/api/assets?available=true", {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/";
          return;
        }

        const data = await res.json();
        const availableAssets = Array.isArray(data)
          ? data.filter((a) => a.status === "IN_STOCK")
          : [];
        setAssets(availableAssets);
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      }
    };
    fetchAssets();
  }, []);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAssetChange = useCallback((assetCode) => {
    setSelectedAssetCode(assetCode);
    const asset = assets.find((a) => a.asset_code === assetCode);
    setSelectedAsset(asset || null);
    setFormData((prev) => ({
      ...prev,
      asset_code: assetCode,
      make_model: asset ? `${asset.make} ${asset.model}` : "",
      serial_no: asset?.serial_no || "",
    }));
  }, [assets]);

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
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        window.location.href = "/";
        return;
      }

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

  // Form sections configuration
  const formSections = useMemo(() => [
    {
      title: null,
      fields: [
        { label: "Form Code", name: "form_id", readOnly: true, defaultValue: formId },
        { label: "Date", name: "date", type: "date", readOnly: true, defaultValue: today },
      ],
    },
    {
      title: "Employee Information",
      fields: [
        { label: "Employee Name", name: "employee_name" },
        { label: "Employee Code", name: "emp_code" },
        { 
          label: "Department", 
          name: "department", 
          type: "select",
          options: ["IT", "HR", "Finance", "Operations", "Sales", "Admin"],
          placeholder: "Select department...",
        },
        { 
          label: "Division", 
          name: "division", 
          type: "select",
          options: ["CNG", "BATTERY", "CORPORATE", "GUJARAT"],
          placeholder: "Select division...",
        },
        { label: "Designation", name: "designation" },
        { label: "Location", name: "location" },
        { label: "Phone", name: "phone" },
        { label: "Email", name: "email", type: "email" },
      ],
    },
    {
      title: "Asset Details",
      fields: [
        { 
          label: "Asset Code", 
          name: "asset_code",
          placeholder: "Search by asset code, make, model, or serial...",
        },
        { label: "Make", name: "make", readOnly: true, defaultValue: selectedAsset?.make },
        { label: "Model", name: "model", readOnly: true, defaultValue: selectedAsset?.model },
        { label: "Serial No", name: "serial_no", readOnly: true, defaultValue: selectedAsset?.serial_no },
        { label: "IP Address", name: "ip_address" },
      ],
    },
    {
      title: "System Configuration",
      note: "Configuration details at the time of asset issue.",
      fields: [
        { 
          label: "Operating System / Software", 
          name: "os_software",
          placeholder: "Windows 11, MS Office 2021, Antivirus",
        },
        { 
          label: "Hostname", 
          name: "hostname",
          placeholder: "GF-LAP-023",
        },
      ],
    },
    {
      title: "Operating Systems & Software Details",
      fields: [
        { label: "Operating System Name", name: "os_name", placeholder: "Windows" },
        { label: "OS Version", name: "os_version", placeholder: "11 Pro" },
        { label: "Microsoft Office Version", name: "office_version", placeholder: "Office 2021" },
        { label: "Antivirus", name: "antivirus", placeholder: "Sophos" },
        { 
          label: "Windows Update", 
          name: "windows_update", 
          type: "select",
          options: ["YES", "NO"],
          defaultValue: "YES",
          placeholder: "Select option...",
        },
        { 
          label: "Local Admin Removed", 
          name: "local_admin_removed", 
          type: "select",
          options: ["YES", "NO"],
          defaultValue: "YES",
          placeholder: "Select option...",
        },
        { 
          label: "Printer Configured", 
          name: "printer_configured", 
          type: "select",
          options: ["YES", "NO"],
          defaultValue: "YES",
          placeholder: "Select option...",
        },
        { 
          label: "SAP Installed", 
          name: "sap", 
          type: "select",
          options: ["YES", "NO"],
          defaultValue: "NO",
          placeholder: "Select option...",
        },
        { 
          label: "Backup Configured", 
          name: "backup_configured", 
          type: "select",
          options: ["YES", "NO"],
          defaultValue: "NO",
          placeholder: "Select option...",
        },
        { 
          label: "7-Zip Installed", 
          name: "zip_7", 
          type: "select",
          options: ["YES", "NO"],
          defaultValue: "YES",
          placeholder: "Select option...",
        },
        { 
          label: "Chrome Installed", 
          name: "chrome", 
          type: "select",
          options: ["YES", "NO"],
          defaultValue: "YES",
          placeholder: "Select option...",
        },
        { 
          label: "OneDrive Configured", 
          name: "onedrive", 
          type: "select",
          options: ["YES", "NO"],
          defaultValue: "YES",
          placeholder: "Select option...",
        },
        { 
          label: "Laptop Bag Provided", 
          name: "laptop_bag", 
          type: "select",
          options: ["YES", "NO"],
          defaultValue: "YES",
          placeholder: "Select option...",
        },
        { label: "RMM Agent", name: "rmm_agent", placeholder: "Kaseya / Intune" },
        { label: "Physical Condition", name: "physical_condition", placeholder: "Good" },
      ],
    },
  ], [formId, today, selectedAsset]);

  const isFormValid = useMemo(() => {
    return (
      formData.asset_code &&
      formData.employee_name &&
      formData.emp_code &&
      formData.terms === "agreed"
    );
  }, [formData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <PageHeader
        title="Issue IT Asset"
        subtitle="Asset Issue / Undertaking Form"
        onBack={() => router.back()}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dynamic Form Sections */}
        {formSections.map((section, index) => (
          <FormSection key={index} title={section.title} note={section.note}>
            {section.fields.map((field) => (
              <FieldBuilder
                key={field.name}
                field={field}
                formData={formData}
                handleChange={handleChange}
                assets={assets}
                selectedAssetCode={selectedAssetCode}
                handleAssetChange={handleAssetChange}
              />
            ))}
          </FormSection>
        ))}

        {/* Declaration */}
        <DeclarationSection
          onChange={handleChange}
          checked={formData.terms === "agreed"}
        />

        {/* Submit */}
        <SubmitButton disabled={submitting || !isFormValid} submitting={submitting} />
      </form>
    </motion.div>
  );
}