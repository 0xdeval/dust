import { usePrepareTokensSell } from "@/hooks/usePrepareTokensSell";
import { ContentHeadline } from "@/layouts/Content/ContentHeadline";
import { ContentContainer } from "@/layouts/Content/ContentContainer";
import { useAppStateContext } from "@/context/AppStateContext";
import { StatusSpinner } from "@/ui/Spinner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { config } from "@/configs/wagmi";
import { useSendTransaction } from "wagmi";
import {
  getTxnStatusCopies,
  mapAddressToTokenName,
  prepareTokensSellingIssueCopies,
  txnErrorToHumanReadable,
} from "@/utils/utils";
import { DefaultPopup } from "@/layouts/Popup/DefaultPopup";
import type { OdosTokensSellingStatus } from "@/types/tokens";

export const TokensSell = () => {
  const [odosTokensSellingStatus, setOdosTokensSellingStatus] =
    useState<OdosTokensSellingStatus | null>(null);

  const { state, updateState, approvedTokens } = useAppStateContext();
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
    console.log("txn status: ", isTransactionFailed, isTransactionExecuted, status);

    if (isTransactionFailed) {
      console.log("Txn execution error:", transactionError);
      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(transactionError?.message),
      });
    }

    if (status === "ERROR" && executionError) {
      console.log("Assemble error:", executionError);
      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(executionError),
      });
    }

    if (quoteError && odosTokensSellingStatus && status === "ERROR") {
      console.log("Quote error:", quoteError);
      return getTxnStatusCopies(true, {
        error: txnErrorToHumanReadable(quoteError),
        unsellableTokens: odosTokensSellingStatus?.tokensCannotBeSold,
      });
    }

    if (isTransactionExecuted && !executionError) {
      return getTxnStatusCopies(false, { hash });
    }

    return getTxnStatusCopies(null, { hash });
  }, [
    isTransactionFailed,
    isTransactionExecuted,
    executionError,
    status,
    hash,
    transactionError,
    quoteError,
    odosTokensSellingStatus,
  ]);

  const handelSecondaryButtonClick = useCallback(() => {
    updateState("APPROVE_TOKENS");
  }, [updateState]);

  useEffect(() => {
    if (unsellableTokens.length > 0) {
      const { tokensCanBeSold, tokensCannotBeSold } = mapAddressToTokenName(
        unsellableTokens,
        approvedTokens
      );

      setOdosTokensSellingStatus({
        tokensCanBeSold,
        tokensCannotBeSold,
      });
    }
  }, [unsellableTokens, approvedTokens]);

  return (
    <>
      <ContentContainer isLoading={!state}>
        {odosTokensSellingStatus && (
          <DefaultPopup
            isOpen={true}
            title="Some tokens are not sellable"
            subtitle={prepareTokensSellingIssueCopies(
              odosTokensSellingStatus.tokensCanBeSold,
              odosTokensSellingStatus.tokensCannotBeSold
            )}
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
