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
    <div className="w-full">
      <div className="px-3 sm:px-4 md:px-6">
        <p className="text-center meme-title tracking-widest font-bold text-xl sm:text-2xl md:text-3xl text-[#F8D12E] mt-4 sm:mt-6 md:mt-16">
          The Ultimate TikTok & Telegram Memecoin Hunter
        </p>
        <p className="meme-subtitle text-muted-foreground font-semibold mt-2 text-center text-xs sm:text-sm md:text-base px-4">
          Realtime tiktok & telegram analytics for memecoins. <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>Hunt the next moonshot 🚀
        </p>
      </div>
      
      {/* Scraper Status */}
      <div className="max-w-[1200px] mx-auto mt-6 sm:mt-8 px-3 sm:px-4">
        <ScraperStatus />
      </div>
      
      {/* Telegram Channels */}
      <div className="mt-12 sm:mt-16">
        <TelegramChannelsHome />
      </div>
      
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4">
        <HeroTable />
      </div>
      {!paid && <UnlockNow text="View the realtime dashboard" />}
      {/* <TimeSeriesChart /> */}
      <TiktokSection />
      <GraphPreview />
      <Separator className="my-6 sm:my-8" />
      {!paid && <UnlockNow text="Unlock All ZoroX features now" />}
      <div className="my-8 sm:my-12" />
    </div>
  );
}
