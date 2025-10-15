import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { zeroAddress, type Address } from "viem";

import RPS from "@/utils/RPS.json";

export type GameData = {
  player1: Address;
  player2: Address;
  stakeAmount: bigint;
  lastAction: bigint;
  player2Move: number;
};

export const useGameData = (contractAddress: Address | string) => {
  const {
    data: contractData,
    isLoading,
    error,
  } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: contractAddress as Address,
        abi: RPS.abi,
        functionName: "j1",
      },
      {
        address: contractAddress as Address,
        abi: RPS.abi,
        functionName: "j2",
      },
      {
        address: contractAddress as Address,
        abi: RPS.abi,
        functionName: "stake",
      },
      {
        address: contractAddress as Address,
        abi: RPS.abi,
        functionName: "lastAction",
      },
      {
        address: contractAddress as Address,
        abi: RPS.abi,
        functionName: "c2",
      },
    ],
    query: {
      enabled: contractAddress !== zeroAddress,
      refetchInterval: 5000,
    },
  });

  const gameData = useMemo<GameData | null>(() => {
    if (!contractData) return null;

    const [player1, player2, stake, lastAction, c2] = contractData;

    return {
      player1: player1 as Address,
      player2: player2 as Address,
      stakeAmount: stake as bigint,
      lastAction: lastAction as bigint,
      player2Move: c2 as number,
    };
  }, [contractData]);

  return {
    gameData,
    isLoading,
    error,
  };
};
