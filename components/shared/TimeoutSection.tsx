import { Loader2 } from "lucide-react";
import { StatusMessage } from "./StatusMessage";

interface TimeoutSectionProps {
  hasTimedOut: boolean;
  timeoutMessage: string;
  isTimeoutAvailable: boolean;
  waitingMessage: string;
  formatTime: () => string;
  isLoading: boolean;
  onTimeout: () => void;
}

export function TimeoutSection({
  hasTimedOut,
  timeoutMessage,
  isTimeoutAvailable,
  waitingMessage,
  formatTime,
  isLoading,
  onTimeout,
}: TimeoutSectionProps) {
  if (hasTimedOut) {
    return (
      <StatusMessage
        variant={timeoutMessage.includes("You") ? "success" : "error"}
        className="text-center"
      >
        <p className="font-bold">{timeoutMessage}</p>
      </StatusMessage>
    );
  }

  return (
    <>
      <StatusMessage variant={isTimeoutAvailable ? "success" : "info"}>
        <p className="text-sm font-semibold">
          {isTimeoutAvailable ? (
            "You can now call timeout!"
          ) : (
            <>
              {waitingMessage} <span className="font-bold">{formatTime()}</span>
            </>
          )}
        </p>
      </StatusMessage>

      <button
        onClick={onTimeout}
        disabled={!isTimeoutAvailable || isLoading}
        className={`w-full flex items-center justify-center py-3.5 text-sm font-semibold rounded-lg transition-all ${
          !isTimeoutAvailable || isLoading
            ? "bg-primary/50 cursor-not-allowed"
            : "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
        } text-white`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2 inline-block" size={18} />
            Calling Timeout...
          </>
        ) : (
          "Call Timeout"
        )}
      </button>
    </>
  );
}
