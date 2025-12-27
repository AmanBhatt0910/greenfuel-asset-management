// app/dashboard/assets/return/page.jsx

import { Suspense } from "react";
import ReturnClient from "./ReturnClient";

export default function ReturnPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">Loading return page…</p>}>
      <ReturnClient />
    </Suspense>
  );
}
