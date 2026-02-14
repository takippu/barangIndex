import { Suspense } from "react";
import { LoginScreen } from "@/src/components/LoginScreen";

export default function LoginPage() {
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
