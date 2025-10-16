/**
 * Watches blockchain for game-ending events on the current game contract.
 * Detects solve (winner determination), j1Timeout, and j2Timeout transactions.
 * Stops watching once a winner is determined or timeout occurs.
 */

import { useWatchBlocks } from "wagmi";
import { decodeFunctionData, zeroAddress } from "viem";
import { useRef } from "react";
import { waitForTransactionReceipt } from "wagmi/actions";

import RPS from "@/utils/RPS.json";
import { getWinner} from "@/utils/constant";
import { config } from "@/config/wagmi";
import { toast } from "sonner";
import { UseWatchGameBlocksProps } from "@/types/hooks.interface";

export function useWatchGameBlocks({
  currentGame,
  gameData,
  winner,
  p1Timeout,
  p2Timeout,
  setWinner,
  setP1Timeout,
  setP2Timeout,
}: UseWatchGameBlocksProps) {
  // Use ref to avoid stale closure issues in onBlock callback
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

      // Return if game already ended
      if (!gameData || winner || currentGame === zeroAddress) {
        return;
      }

      for (const tx of block.transactions) {
        try {
          // Checking for the transaction sent to our game contract. If not, then continue
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

          // Player 1 solved - calculate winner from revealed move
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

          // Player 2 claimed timeout on Player 1
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
              }
            }
          }

          // Player 1 claimed timeout on Player 2
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
              }
            }
          }
        } catch (error: any) {
          toast.error(`Error: ${error?.details}`);
        }
      }
    },
  });
}