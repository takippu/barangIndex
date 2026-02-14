
import { SubmitScreen } from "@/src/components/SubmitScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

export default async function SubmitPage() {
  await requireServerSession("/submit");
  return <SubmitScreen />;
}
