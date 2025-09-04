import TiktokSectionBody from "./body";
import TikTokCarousel from "./carousel";
import RealTimeTikTokFeed from "./real-time-feed";
import AnalyticsDashboard from "./analytics-dashboard";

export default function TiktokSection() {
  return (
    <div className="relative w-full mt-16">
      <div className="absolute w-full h-8 top-0 bg-gradient-to-b from-black/80 to-transparent" />
      <div className=" bg-muted-foreground transition duration-300 ease-in-out group hover:bg-iris-primary">
        <div className="flex flex-col xl:flex-row justify-between w-full xl:w-[1200px] mx-auto">
          <TiktokSectionBody />
          <TikTokCarousel />
        </div>
      </div>
      <div className="absolute w-full h-8 bottom-0 bg-gradient-t from-black/80 to-transparent" />
      
      {/* Real-time TikTok Feed */}
      <div className="mt-16">
        <RealTimeTikTokFeed />
      </div>
      
      {/* Analytics Dashboard */}
      <div className="mt-16">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
