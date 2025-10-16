import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";

import { useGameContext } from "@/context/GameContext";
import Input from "../shared/Input";
import { LoadGameFormValues, loadGameSchema } from "@/utils/gameSchema";

/**
 * Form for loading an existing RPSLS game by contract address.
 * Validates the address format and sets it as the active game in context.
 */
const LoadGame = () => {
  const { isConnected } = useAccount();
  const { setCurrentGame } = useGameContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoadGameFormValues>({
    resolver: zodResolver(loadGameSchema),
    defaultValues: {
      contractAddress: "",
    },
  });

  // Load the game contract and clear the form
  const onSubmit = (data: LoadGameFormValues) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first to load the game.");
      return;
    }
    setCurrentGame?.(data.contractAddress);
    toast.success("Game Loaded Successfully");
    reset({
      contractAddress: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-1">
          Load Existing Game
        </h2>
        <p className="text-sm text-foreground/60">
          Connect to an existing game contract by entering its address
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 rounded-xl border border-white/10 bg-background/30 backdrop-blur-sm"
      >
        <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
          <Input
            type="text"
            label="Contract Address"
            placeholder="0x..."
            {...register("contractAddress")}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2.5 px-8 flex justify-center items-center text-sm font-semibold rounded-lg transition-all whitespace-nowrap h-[42px] ${
              isSubmitting
                ? "bg-primary/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            } text-white`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 inline-block" size={18} />
                Loading...
              </>
            ) : (
              "Load Game"
            )}
          </button>
        </div>
        {errors.contractAddress && (
          <p className="text-red-400 text-xs mt-1 ml-0.5">
            {errors.contractAddress.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default LoadGame;
