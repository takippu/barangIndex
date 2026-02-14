import { MarketDetailScreen } from "@/src/components/MarketDetailScreen";
import { requireServerSession } from "@/src/server/auth/server-session";

type PageProps = {
  params: Promise<{ marketId: string }>;
};

export default async function MarketDetailPage({ params }: PageProps) {
  await requireServerSession("/markets");
  const { marketId } = await params;
  const parsedMarketId = Number.parseInt(marketId, 10);

  return <MarketDetailScreen marketId={Number.isFinite(parsedMarketId) ? parsedMarketId : 0} />;
}
