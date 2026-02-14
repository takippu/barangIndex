import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/src/server/auth/server-session";
import { LoginScreen } from "@/src/components/LoginScreen";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/home");
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#17cf5a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginScreen />
    </Suspense>
  );
}
