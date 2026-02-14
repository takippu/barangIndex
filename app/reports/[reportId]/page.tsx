import { ReportDetailScreen } from "@/src/components/ReportDetailScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

type PageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportDetailPage({ params }: PageProps) {
  await requireServerSession(`/reports/${(await params).reportId}`);
  return <ReportDetailScreen />;
}
