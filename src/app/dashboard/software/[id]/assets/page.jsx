"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Monitor,
  Package,
  Layers
} from "lucide-react";

export default function SoftwareAssetsPage() {

  const { id } = useParams();
  const router = useRouter();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch(`/api/software/${id}/assets`, {
      credentials: "include"
    })
      .then(res => {

        if (res.status === 401)
          window.location.href = "/";

        return res.json();

      })
      .then(setAssets)
      .finally(() => setLoading(false));

  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="text-secondary">
          Loading assets...
        </div>
      </div>
    );

  return (

    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >

      {/* Header */}
      <div className="flex justify-between items-center">

        <div>

          <div className="flex items-center gap-2">

            <Layers className="accent"/>

            <h2 className="text-3xl font-bold text-primary">
              Installed Assets
            </h2>

          </div>

          <div className="text-secondary text-sm mt-1">
            {assets.length} asset(s) using this software
          </div>

        </div>

        <button
          onClick={() => router.back()}
          className="
            px-4 py-2 rounded-xl
            surface border-default
            text-secondary flex gap-2 items-center
          "
        >
          <ArrowLeft size={16}/>
          Back
        </button>

      </div>

      {/* Empty */}
      {assets.length === 0 && (

        <div className="
          surface border-default rounded-xl p-10 text-center
        ">

          <Package size={40}
            className="mx-auto mb-3 text-secondary"/>

          <div className="text-primary font-medium">
            No assets using this software
          </div>

        </div>

      )}

      {/* Grid */}
      <div className="
        grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5
      ">

        {assets.map(asset => (

          <motion.div
            key={asset.assignment_id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              surface border-default rounded-2xl p-5
              shadow-lg hover:shadow-xl transition
            "
          >

            <div className="flex items-center gap-2 mb-2">

              <Monitor className="accent"/>

              <div className="font-semibold text-primary">
                {asset.asset_code}
              </div>

            </div>

            <div className="text-sm text-secondary">
              {asset.make} {asset.model}
            </div>

            <div className="text-xs text-secondary mt-1">
              Serial: {asset.serial_no}
            </div>

            <button
              onClick={() =>
                router.push(`/dashboard/assets/${asset.asset_id}`)
              }
              className="
                mt-4 w-full py-2 rounded-xl
                accent-bg accent font-medium
                hover:opacity-90
              "
            >
              View Asset
            </button>

          </motion.div>

        ))}

      </div>

    </motion.div>

  );

}