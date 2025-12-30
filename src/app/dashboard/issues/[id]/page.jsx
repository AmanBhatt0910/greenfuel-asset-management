// src/app/dashboard/issues/[id]/page.jsx

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Save, FileText } from "lucide-react";
import FormInput from "@/components/FormInput";
import FormSelectSearchable from "@/components/FormSelectSearchable";

export default function IssueDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const search = useSearchParams();
  const mode = search.get("mode") || "view";
  const isEdit = mode === "edit";
  const [issue, setIssue] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await fetch(`/api/issues/${id}`, {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/";
          return;
        }

        if (!res.ok) return;
        const data = await res.json();
        setIssue(data);
      } catch (err) {
        console.error("Failed to fetch issue:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  const onChange = (field, value) => {
    setIssue((prev) => ({ ...prev, [field]: value || "" }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          employee_name: issue.employee_name,
          emp_code: issue.emp_code,
          department: issue.department,
          division: issue.division,
          designation: issue.designation,
          location: issue.location,
          phone: issue.phone,
          email: issue.email,
          ip_address: issue.ip_address,
          os_software: issue.os_software,
          hostname: issue.hostname,
          remarks: issue.remarks,
          terms: issue.terms,
          os_name: issue.os_name,
          os_version: issue.os_version,
          office_version: issue.office_version,
          antivirus: issue.antivirus,
          windows_update: issue.windows_update,
          local_admin_removed: issue.local_admin_removed,
          printer_configured: issue.printer_configured,
          sap: issue.sap,
          backup_configured: issue.backup_configured,
          zip_7: issue.zip_7,
          chrome: issue.chrome,
          onedrive: issue.onedrive,
          laptop_bag: issue.laptop_bag,
          rmm_agent: issue.rmm_agent,
          physical_condition: issue.physical_condition,
        }),
      });

      if (res.status === 401) {
        window.location.href = "/";
        return;
      }

      if (res.ok) {
        router.replace(`/dashboard/issues/${id}?mode=view`);
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[color:var(--accent)]/30 border-t-[color:var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary">Loading issue…</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return <div className="text-secondary">Issue not found</div>;
  }

  // Configuration for form sections with field types and options
  const sections = [
    {
      title: "Employee Information",
      fields: [
        { label: "Employee Name", key: "employee_name", type: "text", editable: true },
        { label: "Employee Code", key: "emp_code", type: "text", editable: true },
        { 
          label: "Department", 
          key: "department", 
          type: "select", 
          editable: true,
          options: ["IT", "HR", "Finance", "Operations", "Sales", "Admin"]
        },
        { 
          label: "Division", 
          key: "division", 
          type: "select", 
          editable: true,
          options: ["CNG", "BATTERY", "CORPORATE", "GUJARAT"]
        },
        { label: "Designation", key: "designation", type: "text", editable: true },
        { label: "Location", key: "location", type: "text", editable: true },
        { label: "Phone", key: "phone", type: "text", editable: true },
        { label: "Email", key: "email", type: "email", editable: true },
      ],
    },
    {
      title: "Asset Details",
      fields: [
        { label: "Asset Code", key: "asset_code", type: "text", editable: false },
        { label: "Make / Model", key: "make_model", type: "text", editable: false },
        { label: "Serial No", key: "serial_no", type: "text", editable: false },
      ],
    },
    {
      title: "Technical / Remarks",
      fields: [
        { label: "IP Address", key: "ip_address", type: "text", editable: true },
        { label: "OS / Software", key: "os_software", type: "text", editable: true },
        { label: "Hostname", key: "hostname", type: "text", editable: true },
        { label: "Remarks", key: "remarks", type: "text", editable: true },
      ],
    },
    {
      title: "OS & Software Configuration",
      fields: [
        { label: "OS Name", key: "os_name", type: "text", editable: true },
        { label: "OS Version", key: "os_version", type: "text", editable: true },
        { label: "Office Version", key: "office_version", type: "text", editable: true },
        { label: "Antivirus", key: "antivirus", type: "text", editable: true },
        { 
          label: "Windows Update", 
          key: "windows_update", 
          type: "select", 
          editable: true,
          options: ["YES", "NO"]
        },
        { 
          label: "Local Admin Removed", 
          key: "local_admin_removed", 
          type: "select", 
          editable: true,
          options: ["YES", "NO"]
        },
        { 
          label: "Printer Configured", 
          key: "printer_configured", 
          type: "select", 
          editable: true,
          options: ["YES", "NO"]
        },
        { 
          label: "SAP Installed", 
          key: "sap", 
          type: "select", 
          editable: true,
          options: ["YES", "NO"]
        },
        { 
          label: "Backup Configured", 
          key: "backup_configured", 
          type: "select", 
          editable: true,
          options: ["YES", "NO"]
        },
        { 
          label: "7-Zip Installed", 
          key: "zip_7", 
          type: "select", 
          editable: true,
          options: ["YES", "NO"]
        },
        { 
          label: "Chrome Installed", 
          key: "chrome", 
          type: "select", 
          editable: true,
          options: ["YES", "NO"]
        },
        { 
          label: "OneDrive Configured", 
          key: "onedrive", 
          type: "select", 
          editable: true,
          options: ["YES", "NO"]
        },
        { 
          label: "Laptop Bag Provided", 
          key: "laptop_bag", 
          type: "select", 
          editable: true,
          options: ["YES", "NO"]
        },
        { label: "RMM Agent", key: "rmm_agent", type: "text", editable: true },
        { label: "Physical Condition", key: "physical_condition", type: "text", editable: true },
      ],
    },
  ];

  // Render field based on type
  const renderField = (field) => {
    const isFieldEditable = field.editable && isEdit;
    const fieldValue = issue[field.key] || "";

    // Select fields with options (dropdowns)
    if (field.type === "select" && field.options) {
      // In view mode, show as regular input
      if (!isFieldEditable) {
        return (
          <FormInput
            key={field.key}
            label={field.label}
            value={fieldValue}
            readOnly
          />
        );
      }
      
      // In edit mode, show as searchable select
      return (
        <FormSelectSearchable
          key={field.key}
          label={field.label}
          options={field.options}
          value={fieldValue}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={`Select ${field.label.toLowerCase()}...`}
          searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
        />
      );
    }

    // Regular text/email inputs
    return (
      <FormInput
        key={field.key}
        label={field.label}
        type={field.type || "text"}
        value={fieldValue}
        readOnly={!isFieldEditable}
        onChange={
          isFieldEditable
            ? (e) => onChange(field.key, e.target.value)
            : undefined
        }
      />
    );
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
          <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
            <FileText className="accent" />
            Issue {isEdit ? "Edit" : "Details"}
          </h2>
          <p className="text-sm text-secondary">
            Asset Code: {issue.asset_code}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/dashboard/issues")}
            className="px-4 py-2 rounded-xl surface border-default hover:surface-muted transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          {!isEdit && (
            <button
              onClick={() => router.push(`/dashboard/issues/${id}?mode=edit`)}
              className="px-4 py-2 rounded-xl font-semibold gradient-accent text-white hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Edit size={16} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Sections */}
      {sections.map((section) => (
        <Section key={section.title} title={section.title}>
          <Grid>
            {section.fields.map(renderField)}
          </Grid>
        </Section>
      ))}

      {/* Save Bar */}
      {isEdit && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl font-semibold shadow-lg gradient-accent text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* Helper Components */
function Section({ title, children }) {
  return (
    <section className="surface-card p-6">
      <h3 className="text-lg font-semibold accent mb-4">{title}</h3>
      {children}
    </section>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  );
}