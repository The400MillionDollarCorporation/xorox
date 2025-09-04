import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TokenData, Tweet } from "@/lib/types";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function Tweets({
  tweets,
  symbol,
  growth,
}: {
  tweets: Tweet[];
  symbol: string;
  growth: string;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only start scrolling after we're on the client side
    if (!isClient) return;

    const scrollContainer = scrollContainerRef.current;
    let scrollInterval: NodeJS.Timeout;
    let isAtEnd = false;

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          if (!isAtEnd) {
            scrollContainer.scrollLeft += 1;
            if (
              scrollContainer.scrollLeft + scrollContainer.clientWidth >=
              scrollContainer.scrollWidth
            ) {
              isAtEnd = true;
            }
          } else {
            scrollContainer.scrollLeft -= 1;
            if (scrollContainer.scrollLeft <= 0) {
              isAtEnd = false;
            }
          }
        }
      }, 30);
    };

    const stopScrolling = () => {
      clearInterval(scrollInterval);
    };

    if (scrollContainer) {
      startScrolling();

      const container = scrollContainer;
      container.onmouseenter = stopScrolling;
      container.onmouseleave = startScrolling;
    }

    return () => {
      stopScrolling();
      if (scrollContainer) {
        scrollContainer.onmouseenter = null;
        scrollContainer.onmouseleave = null;
      }
    };
  }, [isClient]);
  function timeAgo(timestamp: string): string {
    const now = new Date();
    const timeDifferenceInSeconds = Math.floor(
      (now.getTime() - new Date(timestamp).getTime()) / 1000
    );

    const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
    const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
    const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);

    if (timeDifferenceInSeconds < 60) {
      return `${timeDifferenceInSeconds}s ago`;
    } else if (timeDifferenceInMinutes < 60) {
      return `${timeDifferenceInMinutes}m ago`;
    } else if (timeDifferenceInHours < 24) {
      return `${timeDifferenceInHours}h ago`;
    } else if (timeDifferenceInDays < 7) {
      return `${timeDifferenceInDays}d ago`;
    } else {
      return `${Math.floor(timeDifferenceInDays / 7)}wk ago`;
    }
  }

  // Usage example:
  const timestamp = "2024-12-07T12:00:00Z"; // Example timestamp
  console.log(timeAgo(timestamp)); // Output: "x hours ago" or "y minutes ago"

  return (
    <>
      <div className="flex justify-between sen my-12 items-center">
        <div className="flex flex-col w-full">
          <p className="text-xl md:text-2xl text-center mx-auto md:mx-0 md:text-start font-bold nouns tracking-widest text-iris-primary">
            Iris Tweets
          </p>
          <p className="text-xs md:text-sm text-center mx-auto md:mx-0 md:text-start lg:text-md text-muted-foreground font-semibold">
            View all tweets made by Iris about ${symbol.toUpperCase()}
          </p>
        </div>
        <p className="hidden md:block font-semibold text-right">
          <span
            className={`${growth != "0" && "text-green-500 "} "font-bold mr-1"`}
          >
            {growth == "0" && "No"}
            {growth != "0" && "x"}
          </span>{" "}
          growth since the first tweet
        </p>
      </div>
      {tweets.length > 0 ? (
        <ScrollArea className="w-[400px] sm:w-[600px] md:w-[720px] lg:w-[1000px] xl:w-[1200px] ">
          <div
            ref={scrollContainerRef}
            className="flex space-x-2 p-2 overflow-x-hidden"
          >
            {tweets.map((tweet, index) => (
              <Card
                key={index}
                className="rounded-lg mt-2 mb-4 transform transition-all duration-300 hover:scale-105 hover:border hover:border-[1px] hover:border-iris-primary cursor-pointer"
                onClick={() => {
                  console.log("tweet", tweet);
                  window.open(
                    "https://x.com/iris_internet/status/1867331863993627085",
                    "_blank"
                  );
                }}
              >
                <CardContent className="p-4 w-[300px] sen">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={"/iris.jpg"}
                      width={28}
                      height={28}
                      alt="Iris Logo"
                      className="rounded-full"
                    />
                    <div className="flex flex-col justify-center">
                      <p className="text-md font-bold text-white leading-tight">
                        Iris
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        @iris_internet
                      </p>
                    </div>
                    <div className="flex-1 flex justify-end">
                      <p className="text-xs text-gray-400">
                        {timeAgo(tweet.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div>
                      <div className="flex items-center justify-between"></div>
                      <p className="text-sm text-white mt-2">{tweet.tweet}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="w-full h-[50px] flex justify-center items-center">
          <p className="sen text-muted-foreground">No tweets yet</p>
        </div>
      )}
    </>
  );
}
