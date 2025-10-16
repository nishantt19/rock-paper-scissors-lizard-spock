/**
 * Fetches game state from the RPSLS contract.
 * Reads all relevant game data in a single batch call (players, stake, moves, etc).
 * Polls every 5 seconds to keep data fresh.
 */

import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { zeroAddress, type Address, type Hash } from "viem";
import { type GameData } from "@/types/game.types";

import RPS from "@/utils/RPS.json";

export const useGameData = (contractAddress: Address | string) => {

  const contract = {
    address: contractAddress as Address,
    abi: RPS.abi,
  } as const;

  // Batch read all game state in one call
  const {
    data: contractData,
    isLoading,
    error,
  } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        ...contract,
        functionName: "j1", // Player 1 address
      },
      {
        ...contract,
        functionName: "j2", // Player 2 address
      },
      {
        ...contract,
        functionName: "stake", // Stake amount
      },
      {
        ...contract,
        functionName: "lastAction", // Timestamp for timeout calculation
      },
      {
        ...contract,
        functionName: "c2", // Player 2's move
      },
      {
        ...contract,
        functionName: "c1Hash", // Player 1's commitment hash
      },
    ],
    query: {
      enabled: contractAddress !== zeroAddress,
      refetchInterval: 5000, // Poll every 5s
    },
  });

  const gameData = useMemo<GameData | null>(() => {
    if (!contractData) return null;

    const [player1, player2, stake, lastAction, c2, c1Hash] = contractData;

    return {
      player1: player1 as Address,
      player2: player2 as Address,
      stakeAmount: stake as bigint,
      lastAction: lastAction as bigint,
      player2Move: c2 as number,
      commitmentHash: c1Hash as Hash
    };
  }, [contractData]);

  return {
    gameData,
    isLoading,
    error,
  };
};
