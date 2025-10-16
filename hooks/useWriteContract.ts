/**
 * Utility for writing to RPSLS game contracts.
 * Wraps wagmi's writeContract with automatic transaction receipt waiting.
 * Used by game action handlers to interact with the contract.
 */

import type { Address } from "viem";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/config/wagmi";
import RPS from "@/utils/RPS.json";

export const useWriteContract = (contractAddress: Address | string) => {
  // Send transaction and wait for confirmation before resolving
  const writeContractUtil = async (
    func: string,
    value?: bigint,
    args?: any[]
  ) => {
    const hash = await writeContract(config, {
      address: contractAddress as Address,
      abi: RPS.abi,
      functionName: func,
      args: args,
      value: value,
    });
    await waitForTransactionReceipt(config, {
      hash,
    });
  };

  return {
    writeContractUtil,
  };
};
