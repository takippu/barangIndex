import { Suspense } from "react";
import { PriceIndexScreen } from "@/src/components/PriceIndexScreen";

export default function PriceIndexPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#17cf5a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PriceIndexScreen />
    </Suspense>
  );
}
