
import { BadgesScreen } from "@/src/components/BadgesScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

export default async function BadgesPage() {
    await requireServerSession("/badges");
    return <BadgesScreen />;
}
