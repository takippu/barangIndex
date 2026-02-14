import { AlertsScreen } from "@/src/components/AlertsScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

export default async function AlertsPage() {
  await requireServerSession("/alerts");
  return <AlertsScreen />;
}
