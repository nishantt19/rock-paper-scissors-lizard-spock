import { useWatchBlocks } from "wagmi";
import { decodeFunctionData, zeroAddress } from "viem";
import { useRef } from "react";
import { waitForTransactionReceipt } from "wagmi/actions";

import RPS from "@/utils/RPS.json";
import { getWinner, type Winner } from "@/utils/constant";
import { config } from "@/config/wagmi";
import { type GameData } from "./useGameData";
import { toast } from "sonner";

interface UseWatchGameBlocksProps {
  currentGame: string;
  gameData: GameData | null;
  winner: Winner;
  p1Timeout: boolean;
  p2Timeout: boolean;
  setWinner: (w: Winner) => void;
  setP1Timeout: (v: boolean) => void;
  setP2Timeout: (v: boolean) => void;
  resetGameData: () => void;
}

export function useWatchGameBlocks({
  currentGame,
  gameData,
  winner,
  p1Timeout,
  p2Timeout,
  setWinner,
  setP1Timeout,
  setP2Timeout,
  resetGameData,
}: UseWatchGameBlocksProps) {
  const stateRef = useRef({
    gameData,
    winner,
    p1Timeout,
    p2Timeout,
  });

  stateRef.current = { gameData, winner, p1Timeout, p2Timeout };

  useWatchBlocks({
    config,
    includeTransactions: true,
    enabled: Boolean(currentGame && currentGame !== zeroAddress),
    onBlock: async (block) => {
      const { gameData, winner, p1Timeout, p2Timeout } = stateRef.current;
      if (!gameData || winner || currentGame === zeroAddress) {
        return;
      }

      for (const tx of block.transactions) {
        try {
          if (tx.to?.toLowerCase() !== currentGame.toLowerCase()) continue;

          let decoded;
          try {
            decoded = decodeFunctionData({
              abi: RPS.abi,
              data: tx.input,
            });
          } catch {
            continue;
          }

          if (
            decoded.args !== undefined &&
            decoded.functionName === "solve" &&
            tx.from.toLowerCase() === gameData.player1.toLowerCase()
          ) {
            const receipt = await waitForTransactionReceipt(config, {
              hash: tx.hash,
              confirmations: 1,
            });
            if (receipt.status === "success" && decoded.args) {
              setWinner(
                getWinner(Number(decoded.args[0]), gameData.player2Move)
              );
            }
          }

          if (
            decoded.functionName === "j1Timeout" &&
            tx.from.toLowerCase() === gameData.player2.toLowerCase()
          ) {
            if (!p1Timeout) {
              const receipt = await waitForTransactionReceipt(config, {
                hash: tx.hash,
                confirmations: 1,
              });
              if (receipt.status === "success") {
                setP1Timeout(true);
                resetGameData();
              }
            }
          }

          if (
            decoded.functionName === "j2Timeout" &&
            tx.from.toLowerCase() === gameData.player1.toLowerCase()
          ) {
            if (!p2Timeout) {
              const receipt = await waitForTransactionReceipt(config, {
                hash: tx.hash,
                confirmations: 1,
              });
              if (receipt.status === "success") {
                setP2Timeout(true);
                resetGameData();
              }
            }
          }
        } catch (error: any) {
          console.error("Error scanning block:", error);
          toast.error(`Error: ${error?.details}`);
        }
      }
    },
  });
}