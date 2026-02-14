
import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/src/server/auth/server-session";

export default async function Home() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/home");
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#1a2e21] flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-white border border-[#17cf5a]/10 rounded-2xl p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">BarangHarga</p>
        <h1 className="mt-2 text-3xl font-extrabold">Community Price Intelligence</h1>
        <p className="mt-3 text-sm text-gray-600">
          Track real market prices, compare reports, and contribute verified updates.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="px-5 py-3 rounded-xl bg-[#17cf5a] text-white font-bold text-sm"
          >
            Login
          </Link>
          <Link
            href="/onboarding"
            className="px-5 py-3 rounded-xl border border-[#17cf5a]/20 text-[#1a2e21] font-bold text-sm"
          >
            Learn More
          </Link>
        </div>
      </div>
    </main>
  );
}
