import { usePrepareTokensSell } from "@/hooks/usePrepareTokensSell";
import { Skeleton } from "@chakra-ui/react";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { ContentContainer } from "../../Content/ContentContainer";
import { useAppStateContext } from "@/context/AppStateContext";
import { StatusSpinner } from "@/components/ui/Spinner";
import { useEffect } from "react";
import { config } from "@/configs/wagmi";
import { useSendTransaction } from "wagmi";
export const TokensSell = () => {
  const { state, approvedTokens } = useAppStateContext();
  const { status, executionData, executionError, quoteData, quoteError } = usePrepareTokensSell();

  const {
    data: hash,
    isPending: isTransactionPending,
    isSuccess: isTransactionExecuted,
    isError: isTransactionFailed,
    error: transactionError,
    sendTransaction,
  } = useSendTransaction({
    config,
  });

  useEffect(() => {
    if (executionData) {
      const tx = {
        to: executionData.transaction.to as `0x${string}`,
        data: executionData.transaction.data as `0x${string}`,
        value: BigInt(executionData.transaction.value || 0),
        gasLimit: BigInt(executionData.transaction.gas || 0),
        chainId: executionData.transaction.chainId,
      };

      sendTransaction(tx);
    }
  }, [executionData, sendTransaction]);

  useEffect(() => {
    console.log("EXECUTIONSTATE: ", { status, executionData, executionError });
  }, [status, executionData, executionError]);

  useEffect(() => {
    console.log("QUOTESTATE: ", { quoteData, quoteError });
  }, [quoteData, quoteError]);

  return (
    <Skeleton loading={!state}>
      <ContentContainer justifyContent="center" alignItems="center">
        {state && (
          <>
            <StatusSpinner
              isLoading={
                status === "LOADING_EXECUTE" || status === "LOADING_QUOTE" || isTransactionPending
              }
              size="xl"
              boxSize="100px"
              borderWidth="5px"
              status={status === "SUCCESS_EXECUTE" ? "success" : "error"}
            />
            <ContentHeadline
              title={state?.contentHeadline}
              subtitle={state?.contentSubtitle}
              hasActionButton={false}
              justifyContent="center"
              alignItems="center"
              copiesJustifyContent="center"
              copiesItemsAlign="center"
            />
            {approvedTokens.length} tokens are selling
            {isTransactionExecuted && "Transaction hash: " + hash}
            {isTransactionFailed && "Transaction error: " + transactionError}
          </>
        )}
      </ContentContainer>
    </Skeleton>
  );
};
