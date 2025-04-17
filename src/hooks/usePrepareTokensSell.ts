import { useEffect, useState } from "react";
import useApiQuery from "./api/useApiQuery";
import type { ApiResponse } from "./api/useApiFetch";
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
import type { OdosStatus } from "@/types/api/odos";
import { stringToBigInt } from "@/lib/utils";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ResourceError } from "@/types/api/resources";

interface OdosErrorResponse {
  detail: string;
  traceId: string;
  errorCode: number;
}

export const usePrepareTokensSell = () => {
  const { address } = useAccount();
  const { approvedTokens, receivedToken, isReadyToSell, selectedNetwork } = useAppStateContext();

  const [quoteRequest, setQuoteRequest] = useState<OdosQuoteRequest | null>(null);
  const [currentQuoteRequestError, setCurrentQuoteRequestError] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<OdosQuoteResponse | null>(null);

  const [executionRequest, setExecutionRequest] = useState<OdosExecuteRequest | null>(null);
  const [executionData, setExecutionData] = useState<OdosExecuteResponse | null>(null);
  const [currentExecutionRequestError, setCurrentExecutionRequestError] = useState<string | null>(
    null
  );

  const [toRefetchQuote, setToRefetchQuote] = useState<boolean>(false);

  const [unsellableTokens, setUnsellableTokens] = useState<Array<string>>([]);

  const [status, setStatus] = useState<OdosStatus>("IDLE");

  useEffect(() => {
    if (isReadyToSell || toRefetchQuote) {
      console.log("unsellableTokens in quote prep: ", unsellableTokens);
      const inputTokens = approvedTokens
        .filter(
          (token) => unsellableTokens.length === 0 || !unsellableTokens.includes(token.address)
        )
        .map((token) => ({
          tokenAddress: token.address,
          amount: token.rawBalance.toString(), // stringToBigInt(token.balance, token.decimals)
        })) as Array<OdosInputToken>;

      console.log("inputTokens in quote prep: ", inputTokens);
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
        chainId: selectedNetwork.id,
      });

      console.log("quoteRequest in quote prep: ", quoteRequest);

      if (inputTokens.length === 0) {
        setStatus("ERROR");
        setCurrentQuoteRequestError(
          unsellableTokens &&
            "It is not possible to find a route for the selected tokens. Please try again with different tokens."
        );
      } else {
        setStatus("LOADING_QUOTE");
        setQuoteRequest(quoteRequest);
      }
    }

    setToRefetchQuote(false);
  }, [
    unsellableTokens,
    approvedTokens,
    receivedToken,
    isReadyToSell,
    address,
    toRefetchQuote,
    selectedNetwork,
  ]);

  const refetchQuote = () => {
    setToRefetchQuote(true);
  };

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
  } = useApiQuery<"odos", "quote", unknown>("odos", "quote", {
    fetchParams: {
      method: "POST",
      body: JSON.stringify(quoteRequest),
    },
    queryOptions: {
      enabled: Boolean(quoteRequest),
      queryKey: ["odos", "quote", quoteRequest],
      retry: 3,
    },
    logError: true,
  });

  // Checking quote and understand if we can't sell some tokens
  useEffect(() => {
    if (quoteError) {
      const errorData = quoteError.data || quoteError;

      if (
        quoteError.status === 400 &&
        errorData &&
        typeof errorData === "object" &&
        "detail" in errorData
      ) {
        const odosError = errorData as OdosErrorResponse;
        const tokenMatches = odosError.detail.match(/\[([^\]]+)\]/);

        if (tokenMatches) {
          const tokens = tokenMatches[1]
            .split(",")
            .map((token) => token.trim())
            .filter((token) => /^0x[a-fA-F0-9]{40}$/.test(token));

          if (tokens.length > 0) {
            setUnsellableTokens(tokens);
            setCurrentQuoteRequestError(
              tokens.length === 1
                ? `Token ${tokens[0]} is not sellable`
                : `Tokens ${tokens.join(", ")} are not sellable`
            );
          } else {
            setCurrentQuoteRequestError(odosError.detail);
          }
        } else {
          setCurrentQuoteRequestError(odosError.detail);
        }
      } else {
        setCurrentQuoteRequestError(quoteError.message || "An error occurred");
      }
      setStatus("ERROR");
    }
  }, [quoteError]);

  useEffect(() => {
    if (generatedQuoteData?.data && !isQuoteLoading && !quoteError) {
      setQuoteData(generatedQuoteData.data as OdosQuoteResponse);
      setStatus("SUCCESS_QUOTE");
      setStatus("LOADING_EXECUTE");
    }
  }, [generatedQuoteData, isQuoteLoading, quoteError]);

  const {
    data: odosExecutionRequest,
    isLoading: isExecutionLoading,
    error: executionError,
  } = useApiQuery<"odos", "execute", unknown>("odos", "execute", {
    fetchParams: {
      method: "POST",
      body: JSON.stringify(executionRequest),
    },
    queryOptions: {
      enabled: Boolean(executionRequest),
      queryKey: ["odos", "execute", executionRequest],
      retry: 3,
    },
    logError: true,
  });

  useEffect(() => {
    if (odosExecutionRequest?.data && !isExecutionLoading) {
      setExecutionData(odosExecutionRequest.data as OdosExecuteResponse);
      setStatus("SUCCESS_EXECUTE");
    }
  }, [executionRequest, isExecutionLoading, odosExecutionRequest]);

  console.log("params:", currentQuoteRequestError, currentExecutionRequestError);

  return {
    status,
    quoteData,
    unsellableTokens,
    quoteError: currentQuoteRequestError,
    executionData,
    executionError: currentExecutionRequestError,
    refetchQuote,
  };
};
