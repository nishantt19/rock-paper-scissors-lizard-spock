import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyableDisplayProps {
  label: string;
  value: string;
  name?: string;
}

const CopyableDisplay: React.FC<CopyableDisplayProps> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(`Failed to copy: ${err}`);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <div className="flex items-center gap-2 group">
        <p className="text-sm text-gray-100 font-mono break-all flex-1">
          {value || "—"}
        </p>
        {value && (
          <button
            onClick={handleCopy}
            className="p-2 rounded-md hover:bg-gray-800 transition-colors flex-shrink-0"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CopyableDisplay;
