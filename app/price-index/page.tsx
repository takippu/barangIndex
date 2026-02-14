import { Suspense } from "react";
import { PriceIndexScreen } from "@/src/components/PriceIndexScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

export default async function PriceIndexPage() {
  await requireServerSession("/price-index");
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PriceIndexScreen />
    </Suspense>
  );
}
