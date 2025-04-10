import { useEffect, useState } from "react";
import useApiQuery from "./api/useApiQuery";
import type {
  OdosInputToken,
  OdosQuoteRequest,
  OdosOutputToken,
  OdosQuoteResponse,
  OdosExecuteResponse,
  OdosExecuteRequest,
} from "@/types/api/odos";
import { buildExecuteRequest, buildQuoteRequest } from "@/lib/odos/buildBody";
import { useAccount } from "wagmi";
import { useAppStateContext } from "@/context/AppStateContext";
import type { OdosStatus } from "@/types/api/statuses";
import { stringToBigInt } from "@/lib/utils";

export const usePrepareTokensSell = () => {
  const { address } = useAccount();
  const { approvedTokens, receivedToken, isReadyToSell } = useAppStateContext();

  const [quoteRequest, setQuoteRequest] = useState<OdosQuoteRequest | null>(null);
  const [quoteData, setQuoteData] = useState<OdosQuoteResponse | null>(null);
  const [executionRequest, setExecutionRequest] = useState<OdosExecuteRequest | null>(null);
  const [executionData, setExecutionData] = useState<OdosExecuteResponse | null>(null);

  const [status, setStatus] = useState<OdosStatus>("IDLE");

  useEffect(() => {
    if (isReadyToSell) {
      const inputTokens = approvedTokens.map((token) => ({
        tokenAddress: token.address,
        amount: stringToBigInt(token.balance, token.decimals).toString(),
      })) as Array<OdosInputToken>;

      const outputTokens = [
        {
          tokenAddress: receivedToken,
          proportion: 1,
        },
      ] as Array<OdosOutputToken>;

      const quoteRequest = buildQuoteRequest({
        inputTokens: inputTokens,
        outputTokens: outputTokens,
        userAddress: address as `0x${string}`,
        chainId: 8453,
      });
      setStatus("LOADING_QUOTE");
      setQuoteRequest(quoteRequest);
    }
  }, [approvedTokens, receivedToken, isReadyToSell, address]);

  useEffect(() => {
    if (quoteData) {
      const executionRequest = buildExecuteRequest({
        pathId: quoteData.pathId,
        userAddress: address as `0x${string}`,
        simulate: true,
      });
      setExecutionRequest(executionRequest);
    }
  }, [quoteData, address]);

  const {
    data: generatedQuoteData,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useApiQuery("odos", "quote", {
    fetchParams: {
      method: "POST",
      body: JSON.stringify(quoteRequest),
    },
    queryOptions: {
      enabled: Boolean(quoteRequest),
    },
  });

  useEffect(() => {
    if (generatedQuoteData && !isQuoteLoading && !quoteError) {
      setQuoteData(generatedQuoteData as OdosQuoteResponse);
      setStatus("SUCCESS_QUOTE");
      setStatus("LOADING_EXECUTE");
    }

    if (quoteError) {
      setStatus("ERROR");
    }
  }, [generatedQuoteData, isQuoteLoading, quoteError]);

  const {
    data: odosExecutionRequest,
    isLoading: isExecutionLoading,
    error: executionError,
  } = useApiQuery("odos", "execute", {
    fetchParams: {
      method: "POST",
      body: JSON.stringify(executionRequest),
    },
    queryOptions: {
      enabled: Boolean(executionRequest),
    },
  });

  useEffect(() => {
    if (odosExecutionRequest && !isExecutionLoading) {
      setExecutionData(odosExecutionRequest as OdosExecuteResponse);
      setStatus("SUCCESS_EXECUTE");
    }
  }, [executionRequest, isExecutionLoading, odosExecutionRequest]);

  return {
    status,
    quoteData,
    quoteError,
    executionData,
    executionError,
  };
};
