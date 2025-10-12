"use client";
import { useState } from "react";
import { isAddress } from "viem";
import { useGameContext } from "@/context/GameContext";
import Input from "./shared/Input";
import { toast } from "sonner";

const JoinGame = () => {
  const [contractAddress, setContractAddress] = useState("");
  const { setCurrentGame } = useGameContext();

  const handleJoinGame = () => {
    if (!isAddress(contractAddress)) {
      toast.error("Please enter a valid contract address.");
      return;
    }
    setCurrentGame?.(contractAddress);
    toast.success("Game joined successfully!");
    setContractAddress("");
  };

  return (
    <div className="grid grid-cols-[4fr_2fr] justify-center items-end gap-4 max-w-4xl mx-auto">
      <Input
        type="text"
        label="Contract Address"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        placeholder="0x..."
        name="contractAddress"
      />
      <button
        onClick={handleJoinGame}
        className="w-full py-[13px] text-white text-xs font-bold rounded-[5px] bg-[#2F64FF] hover:bg-[#1d4ed8] cursor-pointer transition-colors"
      >
        Load Game
      </button>
    </div>
  );
};

export default JoinGame;
