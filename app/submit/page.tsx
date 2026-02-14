import { Suspense } from "react";
import { SubmitScreen } from "@/src/components/SubmitScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

export default async function SubmitPage() {
  await requireServerSession("/submit");
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#17cf5a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SubmitScreen />
    </Suspense>
  );
}
