"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEnvironmentStore } from "@/components/context";
import CommandMenu from "./command-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { shortenAddress } from "@/lib/utils";
// import getSub from "@/lib/supabase/getSub";
import fetchBalances from "@/lib/fetchBalances";
import mintFreeTestBonks from "@/lib/mintFreeTestBonks";
import { useToast } from "@/hooks/use-toast";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setVisible } = useWalletModal();
  const { disconnect, connected, publicKey } = useWallet();
  const { walletAddress, setAddress, setPaid, setBalances } =
    useEnvironmentStore((store) => store);
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only make API calls after we're on the client side
    if (!isClient) return;

    if (walletAddress.length > 0) {
      fetch(`/api/supabase/get-sub?address=${walletAddress}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("EXPIRES");
          console.log(data.expires);
          if (data.expires) {
            if (new Date().getTime() <= data.expires) setPaid(true);
          }
        });
      fetchBalances(walletAddress).then((balances) => {
        console.log("BALANCES");
        console.log(balances);
        setBalances(balances.sol.toString(), balances.token.toString());
      });
    }
  }, [walletAddress, isClient, setPaid, setBalances]);
  return (
    <div className="w-full py-3 sm:py-4 md:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center px-3 sm:px-4 md:px-6 space-y-3 sm:space-y-0">
        <div
          className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 select-none cursor-pointer"
          onClick={() => {
            router.push("/");
          }}
        >
          <Image
            src="/logo.jpg"
            alt="logo"
            width={32}
            height={32}
            className="rounded-full sm:w-10 sm:h-10"
          />
          <p className="font-bold text-base sm:text-lg md:text-2xl crypto-futuristic tracking-widest text-[#F8D12E]">
            ZoroX
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <CommandMenu />
          
          {/* Mobile wallet connection */}
          <div className="flex sm:hidden">
            {!isClient ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
            ) : connected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">
                  {shortenAddress(walletAddress)}
                </span>
              </div>
            ) : (
              <Button
                onClick={() => setVisible(true)}
                size="sm"
                className="text-xs px-3 py-1 h-8"
              >
                Connect
              </Button>
            )}
          </div>
        </div>

        <div className="hidden sm:flex space-y-4 sm:space-y-0 sm:space-x-4">
          {/* <Button
            variant="ghost"
            className="hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
            onClick={async () => {
              if (!connected) {
                toast({
                  title: "Please connect your wallet first",
                  description:
                    "You need to connect your wallet to mint free Test Bonks",
                });
                return;
              }
              console.log("Minting free Test Bonks");
              toast({
                title: "Minting free Test Bonks",
                description: "Please wait for transaction confirmation...",
              });
              await mintFreeTestBonks(walletAddress);
              toast({
                title: "Transaction Successful",
                description: "Minted 500,000 Test Bonks",
              });
            }}
          >
            <p className="meme-playful text-sm sm:text-md font-bold">
              Mint free Test Bonks
            </p>
            <Image
              src="/bonk.png"
              alt="logo"
              width={20}
              height={20}
              className="rounded-full"
            />
          </Button> */}

          <Button
            variant="ghost"
            className="hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
            onClick={() => {
              router.push("/trending-coins");
            }}
          >
            <p className="sen text-sm sm:text-md font-bold">🚀 Trending Coins</p>
          </Button>

          <Button
            variant="ghost"
            className="hidden lg:flex hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
            onClick={() => {
              window.open("https://x.com/AlphaXorox", "_blank");
            }}
          >
            <p className="sen text-sm sm:text-md font-bold">Follow on</p>
            <Image
              src="/x.png"
              alt="logo"
              width={20}
              height={20}
              className="rounded-full"
            />
          </Button>

          <Button
            className="bg-[#F8D12E] hover:bg-[#F8D12E] transform transition hover:scale-105"
            onClick={() => {
              if (!connected) setVisible(true);
              else disconnect();
            }}
          >
            <Image
              src={"/solana.png"}
              width={25}
              height={25}
              className="rounded-full"
              alt="phantom"
            />
            <p className="sen text-sm sm:text-md font-bold">
              {!connected
                ? "Connect Wallet"
                : shortenAddress(publicKey?.toString() ?? "")}
            </p>
          </Button>
        </div>
      </div>
      <div className="flex md:hidden mt-4 justify-center md:justify-start ">
        <Button
          variant="ghost"
          className="hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
          onClick={async () => {
            if (!connected) {
              toast({
                title: "Please connect your wallet first",
                description:
                  "You need to connect your wallet to mint free Test Bonks",
              });
              return;
            }
            console.log("Minting free Test Bonks");
            toast({
              title: "Minting free Test Bonks",
              description: "Please wait for transaction confirmation...",
            });
            await mintFreeTestBonks(walletAddress);
            toast({
              title: "Transaction Successful",
              description: "Minted 500,000 Test Bonks",
            });
          }}
        >
          <p className="sen text-sm sm:text-md font-bold">
            Mint free Test Bonks
          </p>
          <Image
            src="/bonk.png"
            alt="logo"
            width={20}
            height={20}
            className="rounded-full"
          />
        </Button>

        <Button
          variant="ghost"
          className="hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          <p className="sen text-sm sm:text-md font-bold">
            Live Dashboard
          </p>
          <div className="w-2 h-2 bg-[#F8D12E] rounded-full animate-pulse ml-2"></div>
        </Button>

        <Button
          variant="ghost"
          className="hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
          onClick={() => {
            router.push("/trending-coins");
          }}
        >
          <p className="sen text-sm sm:text-md font-bold">🚀 Trending Coins</p>
        </Button>

        <Button
          variant="ghost"
          className="hidden lg:flex hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
          onClick={() => {
            window.open("https://x.com/TokenHunterZoro", "_blank");
          }}
        >
          <p className="sen text-sm sm:text-md font-bold">Follow on</p>
          <Image
            src="/x.png"
            alt="logo"
            width={20}
            height={20}
            className="rounded-full"
          />
        </Button>

        <Button
          className="bg-[#F8D12E] hover:bg-[#F8D12E] transform transition hover:scale-105"
          onClick={() => {
            if (!connected) setVisible(true);
            else disconnect();
          }}
        >
          <Image
            src={"/solana.png"}
            width={25}
            height={25}
            className="rounded-full"
            alt="phantom"
          />
          <p className="sen text-sm sm:text-md font-bold">
            {!connected
              ? "Connect Wallet"
              : shortenAddress(publicKey?.toString() ?? "")}
          </p>
        </Button>
      </div>

      <div className="">{children}</div>
    </div>
  );
}
