
import { ProfileScreen } from "@/src/components/ProfileScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

export default async function ProfilePage() {
    await requireServerSession("/profile");
    return <ProfileScreen />;
}
