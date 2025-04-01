import { useEffect, useState } from "react";
import useApiQuery from "./api/useApiQuery";
import {
  InputToken,
  OdosQuoteRequest,
  OutputToken,
  OdosQuoteResponse,
  OdosExecuteResponse,
} from "@/lib/types/api/odos";
import { buildQuoteRequest } from "@/lib/odos/buildBody";
import { useAccount } from "wagmi";

export const usePrepareTokensSell = () => {
  const { address } = useAccount();

  const [tokensToSell, setTokensToSell] = useState<InputToken[]>([]);
  const [tokenToReceive, setTokenToReceive] = useState<OutputToken[]>([]);

  const [quoteRequest, setQuoteRequest] = useState<OdosQuoteRequest | null>(
    null
  );
  const [quoteData, setQuoteData] = useState<OdosQuoteResponse | null>(null);
  const [executeData, setExecuteData] = useState<OdosExecuteResponse | null>(
    null
  );

  const [status, setStatus] = useState<
    | "idle"
    | "loadingQuote"
    | "loadingExecute"
    | "successQuote"
    | "successExecute"
    | "error"
  >("idle");

  useEffect(() => {
    const quoteRequest = buildQuoteRequest({
      inputTokens: tokensToSell,
      outputTokens: tokenToReceive,
      userAddress: address as `0x${string}`,
    });
    setStatus("loadingQuote");
    setQuoteRequest(quoteRequest);
  }, [tokensToSell]);

  const {
    data: generatedQuoteData,
    isLoading: isQuoteLoading,
    error,
  } = useApiQuery("odos", "quote", {
    fetchParams: {
      method: "POST",
      body: JSON.stringify(quoteRequest),
    },
    queryOptions: {
      enabled: !!quoteRequest,
    },
  });

  useEffect(() => {
    if (generatedQuoteData && !isQuoteLoading) {
      setQuoteData(generatedQuoteData as OdosQuoteResponse);
      setStatus("successQuote");
      setStatus("loadingExecute");
    }
  }, [generatedQuoteData, isQuoteLoading]);

  const {
    data: executeRequest,
    isLoading: isExecuteLoading,
    error: executeError,
  } = useApiQuery("odos", "execute", {
    fetchParams: {
      method: "POST",
      body: JSON.stringify(quoteData),
    },
    queryOptions: {
      enabled: !!quoteData,
    },
  });

  useEffect(() => {
    if (executeRequest && !isExecuteLoading) {
      setExecuteData(executeRequest as OdosExecuteResponse);
      setStatus("successExecute");
    }
  }, [executeRequest, isExecuteLoading]);

  return {
    tokenToReceive,
    setTokensToSell,
    setTokenToReceive,
    status,
  };
};
