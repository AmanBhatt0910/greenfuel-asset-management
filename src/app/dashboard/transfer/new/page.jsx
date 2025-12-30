// src/app/dashboard/transfer/new/page.jsx
"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Send, AlertCircle } from "lucide-react";
import FormInput from "@/components/FormInput";
import FormSelectSearchable from "@/components/FormSelectSearchable";

/* ============================
   Reusable Components
============================ */

// Page Header Component
const PageHeader = ({ icon: Icon, title, subtitle }) => (
  <div>
    <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
      <Icon className="accent" size={28} />
      {title}
    </h2>
    <p className="text-sm text-secondary mt-1">{subtitle}</p>
  </div>
);

// Form Section Component
const FormSection = ({ title, children }) => (
  <section className="surface-card p-6">
    <h3 className="text-lg font-semibold accent mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </section>
);

// Message Alert Component
const MessageAlert = ({ type, message }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        surface-card p-4 flex items-start gap-3
        ${type === 'success' ? 'border-l-4 border-accent' : ''}
        ${type === 'error' ? 'border-l-4 border-danger' : ''}
      `}
    >
      <AlertCircle 
        size={20} 
        className={type === 'success' ? 'accent' : 'text-danger'} 
      />
      <p className={`text-sm ${type === 'success' ? 'text-primary' : 'text-danger'}`}>
        {message}
      </p>
    </motion.div>
  );
};

// Submit Button Component
const SubmitButton = ({ disabled, loading }) => (
  <div className="flex justify-end">
    <button
      type="submit"
      disabled={disabled}
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
);

// Field Builder Component
const FieldBuilder = ({ field, value, onChange, options }) => {
  if (field.type === "select") {
    return (
      <FormSelectSearchable
        label={field.label}
        options={options || []}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        searchPlaceholder={field.searchPlaceholder}
      />
    );
  }

  return (
    <FormInput
      label={field.label}
      value={value}
      readOnly={field.readOnly}
      onChange={field.readOnly ? undefined : onChange}
      placeholder={field.placeholder}
    />
  );
};

/* ============================
   Main Component
============================ */
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
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resIssues, resUsers] = await Promise.all([
          fetch("/api/issues", { credentials: "include" }),
          fetch("/api/users", { credentials: "include" }),
        ]);

        if (resIssues.status === 401 || resUsers.status === 401) {
          window.location.href = "/";
          return;
        }

        const [dataIssues, dataUsers] = await Promise.all([
          resIssues.json(),
          resUsers.json(),
        ]);

        if (!resIssues.ok) throw new Error(dataIssues.message || "Failed to fetch issues");
        if (!resUsers.ok) throw new Error(dataUsers.message || "Failed to fetch users");

        setIssues(dataIssues);
        setUsers(dataUsers);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAssetChange = useCallback((assetCode) => {
    setSelectedAssetCode(assetCode);
    const issue = issuedAssets.find((i) => i.asset_code === assetCode);
    if (!issue) return;

    setFormData((prev) => ({
      ...prev,
      asset_code: issue.asset_code,
      make_model: issue.make_model || "",
      serial_no: issue.serial_no || "",
      from_emp_code: issue.emp_code || "",
      from_emp_name: issue.employee_name || "",
      from_department: issue.department || "",
      from_division: issue.division || "",
      from_location: issue.location || "",
    }));
  }, [issues]);

  const handleUserChange = useCallback((empCode) => {
    const user = users.find((u) => u.emp_code === empCode);
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      to_emp_code: user.emp_code,
      to_emp_name: user.employee_name,
      to_department: user.department || "",
      to_division: user.division || "",
      to_location: user.location || "",
    }));
  }, [users]);

  const resetForm = useCallback(() => {
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
  }, []);

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
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          from_emp_code: formData.from_emp_code,
          to_emp_code: formData.to_emp_code,
          asset_code: formData.asset_code,
          transfer_date: new Date().toISOString().split("T")[0],
          status: "Pending",
        }),
      });

      if (res.status === 401) {
        window.location.href = "/";
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create transfer");
      }

      setMessage("Transfer request submitted successfully!");
      setMessageType("success");
      resetForm();
    } catch (err) {
      setMessage("Error: " + err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Memoized derived data
  const issuedAssets = useMemo(
    () => issues.filter((i) => i.asset_code && i.emp_code),
    [issues]
  );

  const assetOptions = useMemo(
    () =>
      issuedAssets.map((i) => ({
        value: i.asset_code,
        label: `${i.asset_code} - ${i.make_model || "N/A"} (Issued to: ${i.employee_name})`,
      })),
    [issuedAssets]
  );

  const userOptions = useMemo(
    () =>
      users
        .filter((u) => u.emp_code !== formData.from_emp_code)
        .map((u) => ({
          value: u.emp_code,
          label: `${u.employee_name} - ${u.emp_code} (${u.department || "N/A"})`,
        })),
    [users, formData.from_emp_code]
  );

  const isFormValid = useMemo(
    () =>
      formData.asset_code &&
      formData.from_emp_code &&
      formData.to_emp_code &&
      formData.to_emp_code !== formData.from_emp_code,
    [formData]
  );

  // Form sections configuration
  const formSections = [
    {
      title: "Asset Details",
      fields: [
        {
          label: "Select Asset Code",
          name: "asset_code",
          type: "select",
          placeholder: "Search by asset code, model, or current holder...",
          searchPlaceholder: "Type to search assets...",
        },
        { label: "Make/Model", name: "make_model", readOnly: true },
        { label: "Serial Number", name: "serial_no", readOnly: true },
      ],
    },
    {
      title: "Transfer From",
      fields: [
        { label: "Employee Name", name: "from_emp_name", readOnly: true },
        { label: "Emp Code", name: "from_emp_code", readOnly: true },
        { label: "Department", name: "from_department", readOnly: true },
        { label: "Division", name: "from_division", readOnly: true },
        { label: "Location", name: "from_location", readOnly: true },
      ],
    },
    {
      title: "Transfer To",
      fields: [
        {
          label: "Select Employee",
          name: "to_emp_code",
          type: "select",
          placeholder: "Search by name, employee code, or department...",
          searchPlaceholder: "Type to search employees...",
        },
        { label: "Employee Name", name: "to_emp_name", readOnly: true },
        { label: "Emp Code", name: "to_emp_code_display", value: "to_emp_code", readOnly: true },
        { label: "Department", name: "to_department", readOnly: true },
        { label: "Division", name: "to_division", readOnly: true },
        { label: "Location", name: "to_location", readOnly: true },
      ],
    },
    {
      title: "Reason for Transfer",
      fields: [
        {
          label: "Remarks",
          name: "remarks",
          placeholder: "Optional: Provide reason for this transfer",
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        icon={ArrowRightLeft}
        title="Asset Transfer Request"
        subtitle="Transfer an asset from one employee to another"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dynamic Form Sections */}
        {formSections.map((section, idx) => (
          <FormSection key={idx} title={section.title}>
            {section.fields.map((field) => {
              const fieldName = field.value || field.name;
              const fieldValue = formData[fieldName] || "";
              
              let onChange, options;

              if (field.name === "asset_code") {
                onChange = (e) => handleAssetChange(e.target.value);
                options = assetOptions;
              } else if (field.name === "to_emp_code") {
                onChange = (e) => handleUserChange(e.target.value);
                options = userOptions;
              } else {
                onChange = (e) => handleChange(field.name, e.target.value);
              }

              return (
                <FieldBuilder
                  key={field.name}
                  field={field}
                  value={field.name === "asset_code" ? selectedAssetCode : fieldValue}
                  onChange={onChange}
                  options={options}
                />
              );
            })}
          </FormSection>
        ))}

        {/* Message Display */}
        <MessageAlert type={messageType} message={message} />

        {/* Submit */}
        <SubmitButton disabled={loading || !isFormValid} loading={loading} />
      </form>
    </motion.div>
  );
}