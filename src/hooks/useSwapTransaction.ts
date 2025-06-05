import { useCallback } from "react"; // Import useCallback
import { useSendTransaction } from "wagmi";
import { config } from "@/configs/wagmi"; // Assuming this is the correct path for wagmi config
import { SendTransactionMutate } from "@/types/wagmi"; // Assuming this type exists or can be created

interface TransactionData {
  to?: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
  gas?: bigint; // wagmi's useSendTransaction expects 'gas' not 'gasLimit'
  chainId?: number;
}

interface UseSwapTransactionProps {
  transactionData: TransactionData | undefined;
}

export const useSwapTransaction = ({ transactionData }: UseSwapTransactionProps) => {
  const {
    data: hash,
    isPending: isTransactionPending,
    isSuccess: isTransactionSuccess,
    isError: isTransactionError,
    error: transactionError,
    sendTransaction,
  } = useSendTransaction();

  const initiateTransaction = useCallback(() => {
    if (sendTransaction && transactionData) {
      // Ensure that `to` is defined, as it's required by wagmi's sendTransaction
      if (!transactionData.to) {
        console.error("Transaction 'to' address is undefined.");
        // Potentially set an error state here specific to this condition
        return;
      }
      const { to, data, value, gas, chainId } = transactionData;
      sendTransaction({
        config, // Pass the wagmi config
        to,
        data,
        value,
        gas,
        chainId,
      });
    } else {
      console.warn("sendTransaction function or transactionData is not available.");
      // Potentially set an error state here
    }
  }, [sendTransaction, transactionData]); // Add dependencies

  return {
    sendSwapTransaction: initiateTransaction,
    hash,
    isTransactionPending,
    isTransactionSuccess,
    isTransactionError,
    transactionError,
  };
};
