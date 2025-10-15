import React from "react";
import { useAccount, useDeployContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { keccak256, encodePacked, parseEther, isAddress } from "viem";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { config } from "@/config/wagmi";
import RPS from "@/utils/RPS.json";
import {
  LOCALE_STORAGE_KEY,
  type StoredGame,
  Move,
  getPlayableMoves,
} from "@/utils/constant";
import Input from "../shared/Input";
import Select from "../shared/Select";
import { useGameContext } from "@/context/GameContext";
import {
  createGameSchema,
  type CreateGameFormValues,
} from "@/utils/gameSchema";

const CreateGame = () => {
  const { isConnected } = useAccount();
  const { deployContractAsync } = useDeployContract();
  const { setCurrentGame } = useGameContext();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateGameFormValues>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      move: Move.Null,
      amount: "",
      opponentAddress: "",
      salt: "",
    },
    mode: "all",
  });

  const selectedMove = watch("move");

  const generateSalt = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const salt = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    setValue("salt", `0x${salt}`, { shouldValidate: true });
  };

  const handleOpponentAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const address = e.target.value;

    if (address && isAddress(address)) {
      generateSalt();
    } else {
      setValue("salt", "", { shouldValidate: false });
    }
  };

  const onSubmit = async (data: CreateGameFormValues) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first to create a game.");
      return;
    }

    try {
      const p1moveHash = keccak256(
        encodePacked(["uint8", "uint256"], [data.move, BigInt(data.salt)])
      );

      const contract = await deployContractAsync({
        abi: RPS.abi,
        bytecode: RPS.bytecode.object as `0x${string}`,
        args: [p1moveHash, data.opponentAddress],
        value: parseEther(data.amount),
      });

      const txReceipt = await waitForTransactionReceipt(config, {
        hash: contract,
      });

      if (!txReceipt.contractAddress) {
        toast.error("Failed to retrieve contract address from receipt.");
        return;
      }

      setCurrentGame?.(txReceipt.contractAddress);

      const createGame: StoredGame = {
        contractAddress: txReceipt.contractAddress,
        move: data.move.toString(),
        salt: data.salt,
      };

      localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(createGame));

      toast.success("Game Created Successfully");

      reset({
        amount: "",
        move: Move.Null,
        opponentAddress: "",
        salt: "",
      });
    } catch (error: any) {
      console.error("Error creating game: ", error);
      toast.error(`Error: ${error?.details}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-1">
          Create New Game
        </h2>
        <p className="text-sm text-foreground/60">
          Deploy a new game contract and challenge your opponent
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 p-6 rounded-xl border border-white/10 bg-background/30 backdrop-blur-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Select
              label="Your Move"
              options={getPlayableMoves().map(([label, value]) => ({
                label,
                value: value.toString(),
              }))}
              value={selectedMove?.toString() || ""}
              onChange={(val) =>
                setValue("move", Number(val) as Move, { shouldValidate: true })
              }
              placeholder="Select your move"
              name="move"
            />
            {errors.move && (
              <p className="text-red-500 text-xs mt-2 ml-0.5">
                {errors.move.message}
              </p>
            )}
          </div>
          <div>
            <Input
              label="ETH Amount"
              placeholder="0.01"
              type="number"
              step={"any"}
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-2 ml-0.5">
                {errors.amount?.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Input
            label="Opponent Address"
            placeholder="0x..."
            type="text"
            {...register("opponentAddress", {
              onChange: handleOpponentAddressChange,
            })}
          />
          {errors.opponentAddress && (
            <p className="text-red-500 text-xs mt-2 ml-0.5">
              {errors.opponentAddress.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
              <Input
                type="text"
                label="Salt (Hex)"
                placeholder="0x..."
                {...register("salt")}
              />
              <button
                type="button"
                onClick={generateSalt}
                className="py-2.5 px-6 text-sm font-semibold rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all whitespace-nowrap h-fit"
              >
                Generate New Salt
              </button>
            </div>
            {errors.salt && (
              <p className="text-red-500 text-xs mt-2 ml-0.5">
                {errors.salt.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3.5 text-sm font-semibold rounded-lg transition-all ${
            isSubmitting
              ? "bg-primary/50 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          } text-white`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2 inline-block" size={18} />
              Creating Game...
            </>
          ) : (
            "Create Game"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateGame;
