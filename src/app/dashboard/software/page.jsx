// src/app/dashboard/software/page.jsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Eye,
  Search,
  Package,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SoftwarePage() {

  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {

    fetch("/api/software", { credentials: "include" })
      .then((res) => {

        if (res.status === 401) window.location.href = "/";

        return res.json();

      })
      .then(setRows)
      .finally(() => setLoading(false));

  }, []);

  /* Stats */
  const stats = useMemo(() => {

    const total = rows.length;

    const totalLicenses = rows.reduce(
      (sum, s) => sum + (s.seats_total || 0),
      0
    );

    const usedLicenses = rows.reduce(
      (sum, s) => sum + (s.seats_used || 0),
      0
    );

    const highUsage = rows.filter(
      s => s.seats_total && s.seats_used / s.seats_total > 0.8
    ).length;

    return {
      total,
      totalLicenses,
      usedLicenses,
      highUsage,
    };

  }, [rows]);

  /* Filter */
  const filtered = useMemo(() => {

    if (!search) return rows;

    const q = search.toLowerCase();

    return rows.filter(
      s =>
        s.name?.toLowerCase().includes(q) ||
        s.vendor?.toLowerCase().includes(q)
    );

  }, [rows, search]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-secondary">Loading software…</div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h2 className="text-3xl font-bold text-primary">
            Software Inventory
          </h2>

          <p className="text-secondary text-sm">
            Manage software licenses, seats, and assignments
          </p>

        </div>

        <button
          onClick={() => router.push("/dashboard/software/new")}
          className="
            gradient-accent text-white px-5 py-2.5 rounded-xl
            flex items-center gap-2 font-medium shadow-md
            hover:opacity-90 transition
          "
        >
          <Plus size={18}/>
          Register Software
        </button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <StatCard
          icon={Layers}
          label="Total Software"
          value={stats.total}
        />

        <StatCard
          icon={Package}
          label="Total Licenses"
          value={stats.totalLicenses}
        />

        <StatCard
          icon={ShieldCheck}
          label="Licenses Used"
          value={stats.usedLicenses}
        />

        <StatCard
          icon={AlertTriangle}
          label="High Usage"
          value={stats.highUsage}
          danger
        />

      </div>

      {/* Search */}
      <div className="relative max-w-md">

        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search software..."
          className="
            w-full pl-9 pr-3 py-2 rounded-xl
            surface border-default
            text-sm text-primary
            focus:outline-none focus:ring-2 focus:ring-accent-soft
          "
        />

      </div>

      {/* Grid */}
      {filtered.length === 0 ? (

        <EmptyState/>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {filtered.map((s) => {

            const usage = s.seats_total ? Math.round((s.seats_used / s.seats_total) * 100) : 0;

            const isHigh = usage >= 80;

            return (

              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="
                  surface border-default rounded-2xl p-5
                  shadow-lg hover:shadow-xl transition
                "
              >

                {/* Title */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-primary text-lg">
                      {s.name}
                    </h3>
                    <div className="text-xs text-secondary">
                      Vendor: {s.vendor || "-"}
                    </div>
                    <div className="text-xs text-secondary">
                      Version: {s.version || "-"}
                    </div>
                    <div className="text-xs text-secondary">
                      License: {s.license_type}
                    </div>
                  </div>
                  <LicenseBadge usage={usage}/>
                </div>

                {/* License Key */}
                  <div className="mt-3 text-xs text-secondary break-all">
                    Key: {s.license_key || "-"}
                  </div>

                  {/* Dates */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-secondary">

                    <div>
                      Purchase: {s.purchase_date
                        ? new Date(s.purchase_date).toLocaleDateString()
                        : "-"
                      }
                    </div>

                    <div>
                      Expiry: {s.expiry_date
                        ? new Date(s.expiry_date).toLocaleDateString()
                        : "-"
                      }
                    </div>

                  </div>

                  {/* Seats */}
                  <div className="mt-4">

                    <div className="flex justify-between text-xs mb-1">

                      <span>
                        {s.seats_used}/{s.seats_total} used
                      </span>

                      <span className={isHigh ? "text-danger" : "text-secondary"}>
                        {usage}%
                      </span>

                    </div>

                    <div className="w-full h-2 surface-muted rounded-full">

                      <div
                        className={`h-2 rounded-full ${
                          isHigh ? "bg-red-500" : "bg-[var(--accent)]"
                        }`}
                        style={{ width: `${usage}%` }}
                      />

                    </div>

                  </div>

                  {/* Footer */}
                  <div className="mt-3 text-xs text-secondary">
                    Created: {new Date(s.created_at).toLocaleDateString()}
                  </div>


                {/* Version */}
                <div className="mt-3 text-sm text-secondary">
                  Version: {s.version || "-"}
                </div>

                {/* License type */}
                <div className="text-sm text-secondary">
                  License: {s.license_type}
                </div>

                {/* Seats */}
                <div className="mt-4">

                  <div className="flex justify-between text-xs mb-1">

                    <span>
                      {s.seats_used}/{s.seats_total} used
                    </span>

                    <span
                      className={
                        isHigh
                          ? "text-danger"
                          : "text-secondary"
                      }
                    >
                      {usage}%
                    </span>

                  </div>

                  <div className="w-full h-2 surface-muted rounded-full">

                    <div
                      className={`h-2 rounded-full transition-all ${
                        isHigh
                          ? "bg-red-500"
                          : "bg-[var(--accent)]"
                      }`}
                      style={{ width: `${usage}%` }}
                    />

                  </div>

                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-5">
                  <div className="flex gap-2">
                    <ActionButton
                      icon={Eye}
                      onClick={() =>
                        router.push(`/dashboard/software/${s.id}`)
                      }
                    />
                    <ActionButton
                      icon={Edit}
                      onClick={() =>
                        router.push(`/dashboard/software/${s.id}?mode=edit`)
                      }
                    />
                    <ActionButton
                      icon={Trash2}
                      danger
                      onClick={async () => {

                        if (!confirm("Delete this software?"))
                          return;

                        const res = await fetch(`/api/software/${s.id}`, {
                          method: "DELETE",
                          credentials: "include",
                        });

                        if (res.ok)
                          setRows(rows.filter(r => r.id !== s.id));
                        else
                          alert("Delete failed");

                      }}
                    />
                  </div>
                  {/* Installed Assets Button */}
                  <button
                    onClick={() =>
                      router.push(`/dashboard/software/${s.id}/assets`)
                    }
                    className="
                      flex items-center gap-2
                      text-xs px-3 py-1.5
                      rounded-lg border border-default
                      surface hover:surface-muted
                      transition
                    "
                  >
                    <Layers size={14}/>
                    Assets
                    {s.seats_used > 0 && (
                      <span className="
                        accent-bg accent
                        px-2 py-0.5 rounded-md text-xs
                      ">
                        {s.seats_used}
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* Components */

function StatCard({ icon: Icon, label, value, danger }) {

  return (

    <div className="surface border-default rounded-xl p-4 flex items-center gap-3">

      <div className={`p-2 rounded-lg ${
        danger ? "bg-red-500/10 text-danger" : "accent-bg accent"
      }`}>
        <Icon size={18}/>
      </div>

      <div>

        <div className="text-sm text-secondary">
          {label}
        </div>

        <div className="text-xl font-semibold text-primary">
          {value}
        </div>

      </div>

    </div>

  );

}

function LicenseBadge({ usage }) {

  const color =
    usage >= 90
      ? "bg-red-500 text-white"
      : usage >= 70
      ? "bg-yellow-500 text-white"
      : "accent-bg accent";

  return (

    <span className={`text-xs px-2 py-1 rounded-md ${color}`}>
      {usage}%
    </span>

  );

}

function ActionButton({ icon: Icon, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`
        surface border-default rounded-lg p-2
        hover:surface-muted transition
        ${danger ? "text-danger hover:bg-red-500/10" : ""}
      `}
    >
      <Icon size={16}/>
    </button>

  );
}

function EmptyState() {

  return (

    <div className="surface border-default rounded-xl p-10 text-center">

      <Layers size={40} className="mx-auto mb-3 text-secondary"/>

      <div className="text-primary font-medium">
        No software registered
      </div>

      <div className="text-secondary text-sm mt-1">
        Register software to begin managing licenses
      </div>

    </div>

  );

}