// src/app/dashboard/issues/[id]/page.jsx

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Save, FileText } from "lucide-react";
import FormInput from "@/components/FormInput";

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
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setIssue(data);
      setLoading(false);
    };
    fetchIssue();
  }, [id]);

  const onChange = (field, value) => {
    setIssue((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/issues/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
          rmm_agent: issue.rmm_agent,
          physical_condition: issue.physical_condition,
        }),
      });
      if (res.ok) {
        router.replace(`/dashboard/issues/${id}?mode=view`);
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-secondary">Loading issue…</div>;

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
            className={`
              px-4 py-2 rounded-xl surface border-default
              hover:surface-muted transition-colors
              flex items-center gap-2
            `}
          >
            <ArrowLeft size={16} /> Back
          </button>
          {!isEdit && (
            <button
              onClick={() =>
                router.push(`/dashboard/issues/${id}?mode=edit`)
              }
              className={`
                px-4 py-2 rounded-xl font-semibold
                gradient-accent text-white
                hover:opacity-90 transition-opacity
                flex items-center gap-2
              `}
            >
              <Edit size={16} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Employee Info (Editable) */}
      <Section title="Employee Information">
        <Grid>
          <FormInput 
            label="Employee Name" 
            value={issue.employee_name} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("employee_name", e.target.value)} 
          />
          <FormInput 
            label="Employee Code" 
            value={issue.emp_code} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("emp_code", e.target.value)} 
          />
          <FormInput 
            label="Department" 
            value={issue.department} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("department", e.target.value)} 
          />
          <FormInput 
            label="Division" 
            value={issue.division} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("division", e.target.value)} 
          />
          <FormInput 
            label="Designation" 
            value={issue.designation} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("designation", e.target.value)} 
          />
          <FormInput 
            label="Location" 
            value={issue.location} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("location", e.target.value)} 
          />
          <FormInput 
            label="Phone" 
            value={issue.phone} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("phone", e.target.value)} 
          />
          <FormInput 
            label="Email" 
            value={issue.email} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("email", e.target.value)} 
          />
        </Grid>
      </Section>

      {/* Asset Info (ALWAYS READ ONLY) */}
      <Section title="Asset Details">
        <Grid>
          <FormInput label="Asset Code" value={issue.asset_code} readOnly />
          <FormInput label="Make / Model" value={issue.make_model} readOnly />
          <FormInput label="Serial No" value={issue.serial_no} readOnly />
        </Grid>
      </Section>

      {/* Technical */}
      <Section title="Technical / Remarks">
        <Grid>
          <FormInput 
            label="IP Address" 
            value={issue.ip_address} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("ip_address", e.target.value)} 
          />
          <FormInput 
            label="OS / Software" 
            value={issue.os_software} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("os_software", e.target.value)} 
          />
          <FormInput 
            label="Hostname" 
            value={issue.hostname} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("hostname", e.target.value)} 
          />
          <FormInput 
            label="Remarks" 
            value={issue.remarks} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("remarks", e.target.value)} 
          />
        </Grid>
      </Section>

      <Section title="OS & Software Configuration">
        <Grid>
          <FormInput 
            label="OS Name" 
            value={issue.os_name} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("os_name", e.target.value)} 
          />
          <FormInput 
            label="OS Version" 
            value={issue.os_version} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("os_version", e.target.value)} 
          />
          <FormInput 
            label="Office Version" 
            value={issue.office_version} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("office_version", e.target.value)} 
          />
          <FormInput 
            label="Antivirus" 
            value={issue.antivirus} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("antivirus", e.target.value)} 
          />
          <FormInput label="Windows Update" value={issue.windows_update} readOnly />
          <FormInput label="Local Admin Removed" value={issue.local_admin_removed} readOnly />
          <FormInput label="Printer Configured" value={issue.printer_configured} readOnly />
          <FormInput label="SAP" value={issue.sap} readOnly />
          <FormInput label="Backup Configured" value={issue.backup_configured} readOnly />
          <FormInput label="7-Zip" value={issue.zip_7} readOnly />
          <FormInput label="Chrome" value={issue.chrome} readOnly />
          <FormInput label="OneDrive" value={issue.onedrive} readOnly />
          <FormInput label="Laptop Bag" value={issue.laptop_bag} readOnly />
          <FormInput 
            label="RMM Agent" 
            value={issue.rmm_agent} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("rmm_agent", e.target.value)} 
          />
          <FormInput 
            label="Physical Condition" 
            value={issue.physical_condition} 
            readOnly={!isEdit} 
            onChange={(e)=>onChange("physical_condition", e.target.value)} 
          />
        </Grid>
      </Section>

      {/* Save Bar */}
      {isEdit && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            onClick={onSave}
            disabled={saving}
            className={`
              px-6 py-3 rounded-xl font-semibold shadow-lg
              gradient-accent text-white
              hover:opacity-90 transition-opacity
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* Helpers */
function Section({ title, children }) {
  return (
    <section className="surface-card p-6">
      <h3 className="text-lg font-semibold accent mb-4">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  );
}