import { useState, useEffect } from "react";
import type { Address } from "viem";
import { LOCALE_STORAGE_KEY, type StoredGame, Move } from "@/utils/constant";
import { toast } from "sonner";
import { useGameContext } from "@/context/GameContext";

type GameData = {
  player1: Address;
  player2: Address;
  stakeAmount: bigint;
  lastAction: bigint;
  player2Move: number;
};

export const useLocalStorage = (
  gameData: GameData | null,
  address: Address | undefined
) => {
  const { currentGame } = useGameContext();
  const [p1Move, setP1Move] = useState<number>(Move.Null);
  const [p1Secret, setP1Secret] = useState<string>("");
  const [isLocalStorageEmpty, setIsLocalStorageEmpty] = useState<boolean>(false);

  useEffect(() => {
    if (!gameData || address === gameData.player2) return;

    try {
      const item = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (!item) {
        setIsLocalStorageEmpty(true);
        return;
      }
      const parsedData = JSON.parse(item) as StoredGame;
      if(currentGame.toLowerCase() !== parsedData.contractAddress.toLowerCase()){
        setIsLocalStorageEmpty(true);
        return;
      }
      setP1Move(Number(parsedData.move));
      setP1Secret(parsedData.salt);
      setIsLocalStorageEmpty(false);
    } catch (error) {
      console.error("Error accessing local storage: ", error);
      toast.error(`Error accessing local storage: ${error}`)
      setIsLocalStorageEmpty(true);
    }
  }, [gameData, address]);

  return {
    p1Move,
    p1Secret,
    isLocalStorageEmpty,
    setP1Move,
    setP1Secret,
  };
};