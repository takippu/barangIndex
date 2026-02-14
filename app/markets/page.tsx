import { getServerSession } from "@/src/server/auth/server-session";
import { MarketsScreen } from "@/src/components/MarketsScreen";

export default async function MarketsPage() {
  const session = await getServerSession();
  
  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? undefined,
      }
    : null;

  return <MarketsScreen user={user} />;
}
