import dynamic from 'next/dynamic';

const DashboardClient = dynamic(() => import('./dashboard-client'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Iris Dashboard</h1>
          <p className="text-muted-foreground">
          Real-time memecoin analytics and TikTok trend monitoring
          </p>
        </div>
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
  )
});

export default function DashboardPage() {
  return <DashboardClient />;
}
