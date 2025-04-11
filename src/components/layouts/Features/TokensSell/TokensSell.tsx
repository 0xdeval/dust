import { usePrepareTokensSell } from "@/hooks/usePrepareTokensSell";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { ContentContainer } from "../../Content/ContentContainer";
import { useAppStateContext } from "@/context/AppStateContext";
import { StatusSpinner } from "@/components/ui/Spinner";
import { useCallback, useEffect, useMemo } from "react";
import { config } from "@/configs/wagmi";
import { useSendTransaction } from "wagmi";
import { getTxnStatusCopies, txnErrorToHumanReadable } from "@/lib/utils";

export const TokensSell = () => {
  const { state, updateState } = useAppStateContext();
  const { status, executionData, executionError, quoteData, quoteError } = usePrepareTokensSell();

  const {
    data: hash,
    isPending: isTransactionPending,
    isSuccess: isTransactionExecuted,
    isError: isTransactionFailed,
    error: transactionError,
    sendTransaction,
  } = useSendTransaction({ config });

  const isOperationPending = useMemo(
    () => status === "LOADING_EXECUTE" || status === "LOADING_QUOTE" || isTransactionPending,
    [status, isTransactionPending]
  );

  const sendSwapTransaction = useCallback(() => {
    if (executionData && !isTransactionFailed) {
      const tx = {
        to: executionData.transaction.to as `0x${string}`,
        data: executionData.transaction.data as `0x${string}`,
        value: BigInt(executionData.transaction.value || 0),
        gasLimit: BigInt(executionData.transaction.gas || 0),
        chainId: executionData.transaction.chainId,
      };

      sendTransaction(tx);
    }
  }, [executionData, sendTransaction, isTransactionFailed]);

  useEffect(() => {
    if (executionData) sendSwapTransaction();
  }, [executionData, sendSwapTransaction]);

  const startFromScratch = () => {
    updateState("SELECT_TOKENS");
  };

  useEffect(() => {
    console.log("EXECUTIONSTATE: ", { status, executionData, executionError });
  }, [status, executionData, executionError]);

  useEffect(() => {
    console.log("QUOTESTATE: ", { quoteData, quoteError });
  }, [quoteData, quoteError]);

  const txnStatusCopies = useMemo(() => {
    if (isTransactionFailed || status === "ERROR") {
      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(transactionError?.message),
      });
    }
    if (isTransactionExecuted) {
      return getTxnStatusCopies(false, { hash });
    }

    return getTxnStatusCopies(null, { hash });
  }, [isTransactionFailed, isTransactionExecuted, status, hash, transactionError]);

  const handelSecondaryButtonClick = useCallback(() => {
    updateState("APPROVE_TOKENS");
  }, [updateState]);

  return (
    <ContentContainer isLoading={!state}>
      {state && (
        <>
          <StatusSpinner
            isLoading={isOperationPending}
            size="xl"
            boxSize="100px"
            borderWidth="5px"
            status={!isTransactionFailed ? "success" : "error"}
          />
          <ContentHeadline
            title={isOperationPending ? state.contentHeadline : txnStatusCopies?.contentHeadline}
            subtitle={isOperationPending ? state.contentSubtitle : txnStatusCopies?.contentSubtitle}
            hasActionButton={isTransactionFailed || !isOperationPending ? true : false}
            buttonLabel={!isOperationPending ? txnStatusCopies?.contentButtonLabel : undefined}
            buttonAction={
              isTransactionFailed
                ? sendSwapTransaction
                : !isOperationPending
                  ? startFromScratch
                  : undefined
            }
            isButtonDisabled={isOperationPending}
            secondaryButtonLabel="Back"
            secondaryButtonAction={handelSecondaryButtonClick}
            isSecondaryButtonDisabled={false}
          />
        </>
      )}
    </ContentContainer>
  );
};
