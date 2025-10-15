import type { Address } from "viem";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/config/wagmi";
import RPS from "@/utils/RPS.json";

export const useWriteContract = (contractAddress: Address | string) => {
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
