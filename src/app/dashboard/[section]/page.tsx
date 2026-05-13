import { EntrepreneurDashboardContent } from "@/components/dashboard/entrepreneur-dashboard-content";

export default async function EntrepreneurSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <EntrepreneurDashboardContent section={section} />;
}
