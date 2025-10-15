"use client";
import { useAccount } from "wagmi";
import { zeroAddress } from "viem";

import { useGameContext } from "@/context/GameContext";
import { useWatchBlock } from "@/hooks";
import Divider from "@/components/Divider";
import LoadGame from "@/components/load-game";
import Navbar from "@/components/layout/Navbar";
import CreateGame from "@/components/create-game";
import GameResult from "@/components/game-result";

export default function Home() {
  const { address } = useAccount();
  const { setCurrentGame, currentGame } = useGameContext();

  useWatchBlock({
    address,
    currentGame,
    onWatchBlock: (contractAddress) => {
      setCurrentGame?.(contractAddress);
    },
  });

  return (
    <main className="min-h-screen max-w-7xl mx-auto">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {currentGame === zeroAddress ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CreateGame />
            <Divider text="OR" />
            <LoadGame />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GameResult />
          </div>
        )}
      </div>
    </main>
  );
}
