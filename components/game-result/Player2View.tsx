import React, { memo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import Select from "@/components/shared/Select";
import {
  getPlayableMoves,
  Move,
  type Winner,
  type MoveValue,
} from "@/utils/constant";
import { playGameSchema, type PlayGameFormValues } from "@/utils/gameSchema";
import { formatEther } from "viem";
import { GameData } from "@/hooks/useGameData";
import {
  CopyableDisplay,
  Display,
  StatusMessage,
  TimeoutSection,
} from "../shared";

type Player2ViewProps = {
  currentGame: string;
  gameData: GameData;
  isTimeoutAvailable: boolean;
  formatTime: (ms: number) => string;
  p1Timeout: boolean;
  p2Timeout: boolean;
  isP1TimeoutLoading: boolean;
  onTimeout: () => Promise<void> | void;
  onPlay: (move: MoveValue) => Promise<void> | void;
  winner: Winner;
};

const Player2View: React.FC<Player2ViewProps> = ({
  currentGame,
  gameData,
  isTimeoutAvailable,
  formatTime,
  p1Timeout,
  p2Timeout,
  isP1TimeoutLoading,
  onTimeout,
  onPlay,
  winner,
}) => {
  const hasPlayed = gameData.player2Move !== 0;

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PlayGameFormValues>({
    resolver: zodResolver(playGameSchema),
    defaultValues: { move: Move.Null },
    mode: "all",
  });

  const selectedMove = watch("move");

  const onSubmit = async (data: PlayGameFormValues) => {
    try {
      await onPlay(data.move as MoveValue);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to play");
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-1">Your Game</h2>
        <p className="text-sm text-gray-400">Player 2</p>
      </div>

      <CopyableDisplay label="Game Address" value={currentGame} />
      <CopyableDisplay label="Opponent Address" value={gameData.player1} />
      <Display
        label="Amount to Stake"
        value={`${formatEther(gameData.stakeAmount)} ETH`}
      />
      {hasPlayed && (
        <Display
          label="Your Move"
          value={Move[gameData.player2Move as MoveValue]}
        />
      )}
      <div className="border-t border-gray-800 my-2"></div>

      {hasPlayed ? (
        <>
          {p1Timeout ? (
            <div className="text-center py-2 px-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
              <p className="font-bold text-lg">You Called the Timeout!</p>
            </div>
          ) : winner === null ? (
            <TimeoutSection
              hasTimedOut={p1Timeout}
              timeoutMessage="You Called the Timeout!"
              isTimeoutAvailable={isTimeoutAvailable}
              waitingMessage="Waiting for Player 1 to solve. You can call timeout in"
              formatTime={() => formatTime(Number(gameData?.lastAction))}
              isLoading={isP1TimeoutLoading}
              onTimeout={onTimeout}
            />
          ) : (
            <StatusMessage
              variant={
                winner === "draw"
                  ? "warning"
                  : winner === "player1"
                  ? "success"
                  : "error"
              }
            >
              <p className="font-bold text-lg">
                {winner === "draw"
                  ? "It's a tie!"
                  : winner === "player2"
                  ? "You won the game!"
                  : "You lost this round."}
              </p>
            </StatusMessage>
          )}
        </>
      ) : (
        <>
          {p2Timeout ? (
            <div className="py-2 px-3 text-center rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <p className="font-bold">
                Player 1 has timed out because you haven&apos;t played.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div>
                <Select
                  label="Select Your Move"
                  options={getPlayableMoves().map(([label, value]) => ({
                    label,
                    value: value.toString(),
                  }))}
                  value={String(selectedMove ?? Move.Null)}
                  onChange={(val) =>
                    setValue("move", Number(val) as MoveValue, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Select your move"
                  name="move"
                />
                {errors.move && (
                  <p className="text-red-400 text-xs mt-1 ml-0.5">
                    {errors.move.message as string}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 flex justify-center items-center text-sm font-semibold rounded-lg transition-all ${
                  isSubmitting
                    ? "bg-primary/50 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="animate-spin mr-2 inline-block"
                      size={18}
                    />
                    Playing...
                  </>
                ) : (
                  "Play"
                )}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default memo(Player2View);
