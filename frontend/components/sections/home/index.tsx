"use client";
import { Separator } from "@/components/ui/separator";
import HeroTable from "./hero-table";
import UnlockNow from "@/components/unlock-now";
import { useEnvironmentStore } from "@/components/context";
import TimeSeriesChart from "../ticker/time-series-chart";
import TiktokSection from "./tiktok";
import GraphPreview from "./graph-preview";
import ScraperStatus from "./tiktok/scraper-status";
import TelegramChannelsHome from "./telegram-channels";

export default function Home() {
  const { paid } = useEnvironmentStore((store) => store);
  return (
    <div className="w-full px-3 sm:px-4 md:px-6">
      {/* Hero Section */}
      <div className="text-center py-4 sm:py-6 md:py-8">
        <p className="meme-title tracking-widest font-bold text-xl sm:text-2xl md:text-3xl text-[#F8D12E] mb-2 sm:mb-4">
          The Ultimate TikTok & Telegram Memecoin Hunter
        </p>
        <p className="meme-subtitle text-muted-foreground font-semibold text-xs sm:text-sm md:text-base max-w-4xl mx-auto">
          Realtime tiktok & telegram analytics for memecoins. <br className="hidden sm:block" />
          Hunt the next moonshot 🚀
        </p>
      </div>
      
      {/* Scraper Status */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8 md:mb-12">
        <ScraperStatus />
      </div>
      
      {/* Telegram Channels */}
      <div className="mb-6 sm:mb-8 md:mb-12">
        <TelegramChannelsHome />
      </div>
      
      {/* Hero Table */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8 md:mb-12">
        <HeroTable />
      </div>
      
      {/* Unlock Now - Dashboard */}
      {!paid && (
        <div className="mb-6 sm:mb-8 md:mb-12">
          <UnlockNow text="View the realtime dashboard" />
        </div>
      )}
      
      {/* TikTok Section */}
      <div className="mb-6 sm:mb-8 md:mb-12">
        <TiktokSection />
      </div>
      
      {/* Graph Preview */}
      <div className="mb-6 sm:mb-8 md:mb-12">
        <GraphPreview />
      </div>
      
      {/* Separator */}
      <div className="my-6 sm:my-8 md:my-12">
        <Separator />
      </div>
      
      {/* Unlock Now - All Features */}
      {!paid && (
        <div className="mb-6 sm:mb-8 md:mb-12">
          <UnlockNow text="Unlock All ZoroX features now" />
        </div>
      )}
      
      {/* Bottom Spacing */}
      <div className="h-6 sm:h-8 md:h-12" />
    </div>
  );
}
