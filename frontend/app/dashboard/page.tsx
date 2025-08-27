import RealTimeTikTokFeed from "@/components/sections/home/tiktok/real-time-feed";
import AnalyticsDashboard from "@/components/sections/home/tiktok/analytics-dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#F8D12E] mb-4">
            ZoroX Real-Time Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Live memecoin tracking from TikTok • Auto-updates every 30 seconds
          </p>
        </div>
        
        {/* Analytics Dashboard */}
        <AnalyticsDashboard />
        
        {/* Real-time TikTok Feed */}
        <div className="mt-16">
          <RealTimeTikTokFeed />
        </div>
      </div>
    </div>
  );
}
