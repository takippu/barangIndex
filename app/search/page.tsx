import { Suspense } from "react";
import { SearchScreen } from "@/src/components/SearchScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

export default async function SearchPage() {
  await requireServerSession("/search");
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchScreen />
    </Suspense>
  );
}
