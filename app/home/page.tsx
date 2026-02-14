import { HomeScreen } from "@/src/components/HomeScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

export default async function HomePage() {
  await requireServerSession("/home");
  return <HomeScreen />;
}
