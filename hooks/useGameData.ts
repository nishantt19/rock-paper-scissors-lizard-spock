import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { zeroAddress, type Address, type Hash } from "viem";

import RPS from "@/utils/RPS.json";

export type GameData = {
  player1: Address;
  player2: Address;
  stakeAmount: bigint;
  lastAction: bigint;
  player2Move: number;
  commitmentHash: Hash
};

export const useGameData = (contractAddress: Address | string) => {

  const contract = {
    address: contractAddress as Address,
    abi: RPS.abi,
  } as const;

  const {
    data: contractData,
    isLoading,
    error,
  } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        ...contract,
        functionName: "j1",
      },
      {
        ...contract,
        functionName: "j2",
      },
      {
        ...contract,
        functionName: "stake",
      },
      {
        ...contract,
        functionName: "lastAction",
      },
      {
        ...contract,
        functionName: "c2",
      },
      {
        ...contract,
        functionName: "c1Hash",
      },
    ],
    query: {
      enabled: contractAddress !== zeroAddress,
      refetchInterval: 5000,
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
