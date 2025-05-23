import { ContentHeadline } from "@/layouts/Content/ContentHeadline";
import { ContentContainer } from "@/layouts/Content/ContentContainer";
import { useAppStateContext } from "@/context/AppStateContext";
import { StatusSpinner } from "@/ui/Spinner";
import { useCallback, useEffect, useMemo } from "react";
// import { config } from "@/configs/wagmi"; // No longer directly needed here
// import { useSendTransaction } from "wagmi"; // Will be used by the hook
import { useSwapTransaction } from "@/hooks/useSwapTransaction"; // Import the new hook
import {
  getTxnStatusCopies,
  prepareTokensSellingIssueCopies,
  txnErrorToHumanReadable,
} from "@/utils/utils";
import { DefaultPopup } from "@/layouts/Popup/DefaultPopup";
import { useOdosQuote } from "@/hooks/useOdosQuote";
import { useOdosExecute } from "@/hooks/useOdosExecute";

export const TokensSell = () => {
  const { state, updateState, approvedTokens, selectedNetwork } = useAppStateContext();

  const {
    quote,
    unsellableTokens,
    sellableTokens,
    setTokensToCheck,
    setToCheckQuote,
    quoteStatus,
    quoteError,
    isQuoteLoading,
  } = useOdosQuote();

  const {
    executionData,
    isExecutionLoading,
    executionError,
    executionStatus,
    simulationError,
    setQuoteData,
  } = useOdosExecute();

  const transactionData = useMemo(() => {
    if (!executionData) return undefined; // useSwapTransaction expects TransactionData | undefined

    return {
      to: executionData.transaction.to as `0x${string}`,
      data: executionData.transaction.data as `0x${string}`,
      value: BigInt(executionData.transaction.value || 0),
      // Ensure 'gas' is used as per useSwapTransaction, not 'gasLimit'
      gas: executionData.transaction.gas ? BigInt(executionData.transaction.gas) : undefined, 
      chainId: executionData.transaction.chainId,
    };
  }, [executionData]);
  
  const {
    sendSwapTransaction: initiateFullTransaction, // Renamed for clarity in this component
    hash,
    isTransactionPending,
    isTransactionSuccess: isTransactionExecuted, // Keep existing name for less refactoring below
    isTransactionError: isTransactionFailed,   // Keep existing name
    transactionError,
  } = useSwapTransaction({ transactionData });

  const isOperationPending = useMemo(
    () => isQuoteLoading || isExecutionLoading || isTransactionPending,
    [isQuoteLoading, isExecutionLoading, isTransactionPending] // isTransactionPending now from useSwapTransaction
  );

  // The original sendSwapTransaction callback is removed as its logic is in useSwapTransaction

  useEffect(() => {
    if (approvedTokens?.length) {
      setTokensToCheck(approvedTokens);
      setToCheckQuote(true);
    }
  }, [approvedTokens, setTokensToCheck, setToCheckQuote]);

  useEffect(() => {
    if (quoteStatus === "SUCCESS_QUOTE" && quote) {
      setQuoteData(quote);
    }
  }, [quote, quoteStatus, setQuoteData]);

  useEffect(() => {
    if (
      executionStatus === "SUCCESS_EXECUTE" &&
      executionData &&
      !isTransactionFailed && // from useSwapTransaction
      !isTransactionExecuted   // from useSwapTransaction
    ) {
      initiateFullTransaction(); // Call the function from the hook
    }
  }, [
    executionStatus,
    executionData,
    isTransactionFailed,    // from useSwapTransaction
    isTransactionExecuted,  // from useSwapTransaction
    initiateFullTransaction,
  ]);

  const startFromScratch = useCallback(() => {
    updateState("SELECT_TOKENS");
  }, [updateState]);

  const handleSecondaryButtonClick = useCallback(() => {
    updateState("APPROVE_TOKENS");
  }, [updateState]);

  const refetchOdosQuote = useCallback(() => {
    if (sellableTokens?.length) {
      setTokensToCheck(sellableTokens);
      setToCheckQuote(true);
    }
  }, [setTokensToCheck, setToCheckQuote, sellableTokens]);

  const txnStatusCopies = useMemo(() => {
    if (isTransactionFailed && transactionError) { // isTransactionFailed & transactionError from useSwapTransaction
      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(transactionError.message), // transactionError from useSwapTransaction
      });
    }

    if (executionStatus === "ERROR") {
      if (simulationError) {
        return getTxnStatusCopies(true, {
          error: txnErrorToHumanReadable(simulationError),
        });
      }

      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(executionError?.detail),
      });
    }

    if (quoteStatus === "ERROR") {
      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(quoteError?.detail),
        unsellableTokens,
      });
    }

    if (isTransactionExecuted && !executionError && !simulationError) {
      return getTxnStatusCopies(false, { hash, selectedNetwork });
    }

    return getTxnStatusCopies(null, { hash, selectedNetwork });
  }, [
    isTransactionFailed,    // from useSwapTransaction
    isTransactionExecuted,  // from useSwapTransaction
    executionError,
    simulationError,
    hash,                   // from useSwapTransaction
    transactionError,       // from useSwapTransaction
    quoteError,
    quoteStatus,
    executionStatus,
    unsellableTokens,
    selectedNetwork,
  ]);

  const headlineProps = useMemo(
    () => ({
      title: isOperationPending
        ? state?.contentHeadline || ""
        : txnStatusCopies?.contentHeadline || "",
      subtitle: isOperationPending
        ? state?.contentSubtitle || ""
        : txnStatusCopies?.contentSubtitle || "",
      hasActionButton: isTransactionFailed || !isOperationPending,
      buttonLabel: !isOperationPending ? txnStatusCopies?.contentButtonLabel || "" : undefined,
      buttonAction: isTransactionFailed // from useSwapTransaction
        ? initiateFullTransaction // Use the function from the hook to retry
        : !isOperationPending
          ? startFromScratch
          : undefined,
      isButtonDisabled: isOperationPending,
      secondaryButtonLabel: "Back",
      secondaryButtonAction: handleSecondaryButtonClick,
      isSecondaryButtonDisabled: false,
    }),
    [
      isOperationPending,
      state?.contentHeadline,
      state?.contentSubtitle,
      txnStatusCopies,
      isTransactionFailed,    // from useSwapTransaction
      initiateFullTransaction, // retry action
      startFromScratch,
      handleSecondaryButtonClick,
    ]
  );

  const popupContent = useMemo(() => {
    if (unsellableTokens?.length > 0) {
      return (
        <DefaultPopup
          isOpen={true}
          title="Some tokens are not sellable"
          subtitle={prepareTokensSellingIssueCopies(sellableTokens, unsellableTokens)}
          buttonCta="Sell rest"
          buttonHandler={refetchOdosQuote}
        />
      );
    }
    return null;
  }, [unsellableTokens, sellableTokens, refetchOdosQuote]);

  if (!state) {
    return (
      <ContentContainer isLoading={true}>
        <div />
      </ContentContainer>
    );
  }

  return (
    <ContentContainer isLoading={false}>
      {popupContent}
      <StatusSpinner
        isLoading={isOperationPending}
        size="xl"
        boxSize="100px"
        borderWidth="5px"
        status={
          isTransactionFailed ||
          Boolean(quoteError) ||
          Boolean(executionError) ||
          Boolean(simulationError)
            ? "error"
            : "success"
        }
      />
      <ContentHeadline {...headlineProps} />
    </ContentContainer>
  );
};
