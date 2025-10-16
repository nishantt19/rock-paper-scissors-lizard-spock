import React, { memo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import Select from "@/components/shared/Select";
import Input from "@/components/shared/Input";
import CopyableDisplay from "@/components/shared/CopyableDisplay";
import Display from "@/components/shared/Display";
import { TimeoutSection } from "@/components/shared/TimeoutSection";
import { StatusMessage } from "@/components/shared/StatusMessage";

import {
  getPlayableMoves,
  Move,
  type MoveValue,
  getWinnerDisplay,
} from "@/utils/constant";
import { solveGameSchema, type SolveGameFormValues } from "@/utils/gameSchema";
import { type Player1ViewProps } from "@/types/player.types";

const Player1View: React.FC<Player1ViewProps> = ({
  currentGame,
  gameData,
  isLocalStorageEmpty,
  p1Move,
  p1Secret,
  setP1Move,
  setP1Secret,
  isTimeoutAvailable,
  formatTime,
  p1Timeout,
  p2Timeout,
  isP2TimeoutLoading,
  onTimeout,
  onSolve,
  winner,
}) => {
  const showPlayWaitState = gameData.player2Move === 0;

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SolveGameFormValues>({
    resolver: zodResolver(solveGameSchema),
    defaultValues: {
      p1Move: p1Move ?? Move.Null,
      p1Secret: p1Secret ?? "",
    },
    mode: "all",
    values: isLocalStorageEmpty
      ? undefined
      : {
          p1Move,
          p1Secret,
        },
  });

  const onSubmit = async (data: SolveGameFormValues) => {
    const finalMove = isLocalStorageEmpty ? (data.p1Move as MoveValue) : p1Move;
    const finalSecret = isLocalStorageEmpty ? data.p1Secret : p1Secret;

    try {
      await onSolve(finalMove, finalSecret);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to solve");
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-1">Your Game</h2>
        <p className="text-sm text-gray-400">Player 1</p>
      </div>

      {/* Contract Address with Copy */}
      <CopyableDisplay label="Game Address" value={currentGame} />

      {/* Opponent Address with Copy */}
      <CopyableDisplay label="Opponent Address" value={gameData.player2} />

      {/* Editable Move + Salt Section (unchanged) */}
      {isLocalStorageEmpty ? (
        <>
          <StatusMessage variant="warning">
            <p className="text-xs font-semibold">
              Local storage is empty, please enter the move you made and your
              secret salt.
            </p>
          </StatusMessage>

          <Select
            label="Your Move"
            options={getPlayableMoves().map(([label, value]) => ({
              label,
              value: value.toString(),
            }))}
            value={String(p1Move ?? Move.Null)}
            onChange={(val) => {
              const mv = Number(val) as MoveValue;
              setP1Move(mv);
              setValue("p1Move", mv, { shouldValidate: true });
            }}
            placeholder="Select your move"
            name="p1Move"
          />
          {errors.p1Move && (
            <p className="text-red-400 text-xs mt-2 ml-0.5">
              {errors.p1Move.message as string}
            </p>
          )}

          <Input
            type="text"
            label="Your Secret Salt"
            placeholder="0x..."
            value={p1Secret}
            onChange={(e) => {
              setP1Secret(e.target.value);
              setValue("p1Secret", e.target.value, { shouldValidate: true });
            }}
            name="p1Secret"
          />
          {errors.p1Secret && (
            <p className="text-red-400 text-xs mt-2 ml-0.5">
              {errors.p1Secret.message as string}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            <Display label="Your Move" value={Move[p1Move]} />
            <Display label="Your Secret Salt" value={p1Secret} />
          </div>
        </>
      )}

      <div className="border-t border-gray-800 my-2"></div>

      {/* Timeout / Solve Section */}
      {showPlayWaitState ? (
        <TimeoutSection
          hasTimedOut={p2Timeout}
          timeoutMessage="You Called the Timeout!"
          isTimeoutAvailable={isTimeoutAvailable}
          waitingMessage="Waiting for Player 2 to play. You can call timeout in"
          formatTime={formatTime}
          isLoading={isP2TimeoutLoading}
          onTimeout={onTimeout}
        />
      ) : p1Timeout ? (
        <StatusMessage variant="error">
          <p className="font-bold">
            Player 2 called the timeout because you haven&apos;t solved.
          </p>
        </StatusMessage>
      ) : winner === null ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <StatusMessage variant="info">
            <p className="text-sm font-semibold">
              Player 2 has played, you need to solve now.
            </p>
          </StatusMessage>

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
                <Loader2 className="animate-spin mr-2 inline-block" size={18} />
                Solving...
              </>
            ) : (
              "Solve"
            )}
          </button>
        </form>
      ) : (
        (() => {
          const { variant, message } = getWinnerDisplay(winner, "player1");
          return (
            <StatusMessage variant={variant}>
              <p className="font-bold text-lg">{message}</p>
            </StatusMessage>
          );
        })()
      )}
    </div>
  );
};

export default memo(Player1View);
