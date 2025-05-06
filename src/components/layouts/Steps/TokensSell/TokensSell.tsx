import { ContentHeadline } from "@/layouts/Content/ContentHeadline";
import { ContentContainer } from "@/layouts/Content/ContentContainer";
import { useAppStateContext } from "@/context/AppStateContext";
import { StatusSpinner } from "@/ui/Spinner";
import { useCallback, useEffect, useMemo } from "react";
import { config } from "@/configs/wagmi";
import { useSendTransaction } from "wagmi";
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

  const {
    data: hash,
    isPending: isTransactionPending,
    isSuccess: isTransactionExecuted,
    isError: isTransactionFailed,
    error: transactionError,
    sendTransaction,
  } = useSendTransaction({ config });

  const isOperationPending = useMemo(
    () => isQuoteLoading || isExecutionLoading || isTransactionPending,
    [isQuoteLoading, isExecutionLoading, isTransactionPending]
  );

  const transactionData = useMemo(() => {
    if (!executionData) return null;

    return {
      to: executionData.transaction.to as `0x${string}`,
      data: executionData.transaction.data as `0x${string}`,
      value: BigInt(executionData.transaction.value || 0),
      gasLimit: BigInt(executionData.transaction.gas || 0),
      chainId: executionData.transaction.chainId,
    };
  }, [executionData]);

  const sendSwapTransaction = useCallback(() => {
    if (transactionData) {
      sendTransaction(transactionData);
    }
  }, [transactionData, sendTransaction]);

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
      !isTransactionFailed &&
      !isTransactionExecuted
    ) {
      sendSwapTransaction();
    }
  }, [
    executionStatus,
    executionData,
    isTransactionFailed,
    isTransactionExecuted,
    sendSwapTransaction,
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
    if (isTransactionFailed && transactionError) {
      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(transactionError.message),
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
    isTransactionFailed,
    isTransactionExecuted,
    executionError,
    simulationError,
    hash,
    transactionError,
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
      buttonAction: isTransactionFailed
        ? sendSwapTransaction
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
      isTransactionFailed,
      sendSwapTransaction,
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
