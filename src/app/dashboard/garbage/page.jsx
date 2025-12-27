// app/dashboard/garbage/page.jsx

import { Suspense } from "react";
import GarbageClient from "./GarbageClient";

export default function GarbagePage() {
  return (
    <Suspense fallback={<p className="text-gray-400">Loading garbage page…</p>}>
      <GarbageClient />
    </Suspense>
  );
}
