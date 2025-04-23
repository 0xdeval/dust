import { usePrepareTokensSell } from "@/hooks/usePrepareTokensSell";
import { ContentHeadline } from "../../Content/ContentHeadline";
import { ContentContainer } from "../../Content/ContentContainer";
import { useAppStateContext } from "@/context/AppStateContext";
import { StatusSpinner } from "@/components/ui/Spinner";
import { useCallback, useEffect, useMemo } from "react";
import { config } from "@/configs/wagmi";
import { useSendTransaction } from "wagmi";
import { getTxnStatusCopies, txnErrorToHumanReadable } from "@/utils/utils";
import { DefaultPopup } from "../../Popup/DefaultPopup";

export const TokensSell = () => {
  const { state, updateState } = useAppStateContext();
  const { status, unsellableTokens, executionData, executionError, quoteError, refetchQuote } =
    usePrepareTokensSell();

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
    if (executionData && !isTransactionFailed && !isTransactionExecuted) sendSwapTransaction();
  }, [executionData, sendSwapTransaction, isTransactionFailed, isTransactionExecuted]);

  const startFromScratch = () => {
    updateState("SELECT_TOKENS");
  };

  const txnStatusCopies = useMemo(() => {
    if (isTransactionFailed && status === "ERROR") {
      console.log("transactionError:", transactionError);
      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(transactionError?.message),
      });
    }

    if (quoteError && status === "ERROR") {
      console.log("Quote error:", quoteError);
      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(quoteError),
      });
    }

    if (isTransactionExecuted) {
      return getTxnStatusCopies(false, { hash });
    }

    return getTxnStatusCopies(null, { hash });
  }, [isTransactionFailed, isTransactionExecuted, status, hash, transactionError, quoteError]);

  const handelSecondaryButtonClick = useCallback(() => {
    updateState("APPROVE_TOKENS");
  }, [updateState]);

  console.log(
    "status for a spinner:",
    isTransactionFailed,
    quoteError,
    executionError,
    unsellableTokens,
    isTransactionFailed || Boolean(quoteError) || Boolean(executionError) ? "error" : "success"
  );

  return (
    <>
      <ContentContainer isLoading={!state}>
        {quoteError && unsellableTokens.length > 0 && (
          <DefaultPopup
            isOpen={true}
            title="Some tokens are not sellable"
            subtitle="We can't find routes for some tokens, but we can sell the rest. Do you want to proceed?"
            buttonCta="Sell rest"
            buttonHandler={refetchQuote}
          />
        )}
        {state && (
          <>
            <StatusSpinner
              isLoading={isOperationPending}
              size="xl"
              boxSize="100px"
              borderWidth="5px"
              status={
                isTransactionFailed || Boolean(quoteError) || Boolean(executionError)
                  ? "error"
                  : "success"
              }
            />
            <ContentHeadline
              title={isOperationPending ? state.contentHeadline : txnStatusCopies?.contentHeadline}
              subtitle={
                isOperationPending ? state.contentSubtitle : txnStatusCopies?.contentSubtitle
              }
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
    </>
  );
};
