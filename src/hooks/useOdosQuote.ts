import { useState, useEffect, useMemo } from "react";
import type { SelectedToken } from "@/types/tokens";
import type { OdosOutputToken, OdosQuoteResponse, OdosStatus } from "@/types/api/odos";
import useApiQuery from "@/hooks/api/useApiQuery";
import { buildQuoteRequest } from "@/lib/odos/buildBody";
import { useAppStateContext } from "@/context/AppStateContext";
import { useAccount } from "wagmi";

export function useOdosQuote() {
  const [unsellableTokenAddresses, setUnsellableTokenAddresses] = useState<Array<string>>([]);
  const [unsellableTokens, setUnsellableTokens] = useState<Array<SelectedToken>>([]);
  const [sellableTokens, setSellableTokens] = useState<Array<SelectedToken>>([]);
  const [quote, setQuote] = useState<OdosQuoteResponse | null>(null);
  const [tokensToCheck, setTokensToCheck] = useState<Array<SelectedToken>>([]);
  const [toCheckQuote, setToCheckQuote] = useState(false);

  const [quoteStatus, setQuoteStatus] = useState<OdosStatus>("IDLE");

  const { receivedToken, selectedNetwork } = useAppStateContext();
  const { address } = useAccount();

  const quoteRequest = useMemo(() => {
    if (!toCheckQuote) return null;
    return buildQuoteRequest({
      inputTokens: tokensToCheck.map((token) => ({
        tokenAddress: token.address,
        amount: token.rawBalance.toString(),
      })),
      outputTokens: [
        {
          tokenAddress: receivedToken,
          proportion: 1,
        },
      ] as Array<OdosOutputToken>,
      userAddress: address as `0x${string}`,
      chainId: selectedNetwork.id,
    });
  }, [toCheckQuote, tokensToCheck, receivedToken, address, selectedNetwork.id]);

  const quoteRequestKey = useMemo(
    () => (quoteRequest ? JSON.stringify(quoteRequest) : ""),
    [quoteRequest]
  );

  const {
    data,
    isLoading: isPending,
    error,
  } = useApiQuery<"odos", "quote", unknown>("odos", "quote", {
    fetchParams: {
      method: "POST",
      body: JSON.stringify(quoteRequest),
    },
    queryOptions: {
      enabled: Boolean(quoteRequest) && toCheckQuote,
      queryKey: ["odos", "quote", quoteRequestKey],
      retry: 3,
      refetchOnWindowFocus: false,
    },
    logError: true,
  });

  useEffect(() => {
    if (toCheckQuote) {
      setQuote(null);
    }
  }, [toCheckQuote]);

  useEffect(() => {
    if (!toCheckQuote) return;

    if (data?.data && !isPending && !error) {
      setQuoteStatus("SUCCESS_QUOTE");
      setQuote(data.data as OdosQuoteResponse | null);
      setToCheckQuote(false);
    } else if (error && (error.data as { detail?: string })?.detail) {
      setQuoteStatus("ERROR");
      setQuote(null);
      setToCheckQuote(false);

      let unsellableTokenAddresses: Array<string> = [];
      let unsellableTokens: Array<SelectedToken> = [];
      let sellableTokens: Array<SelectedToken> = tokensToCheck;

      const detail = (error.data as { detail: string }).detail;
      const tokenMatches = detail.match(/\[([^\]]+)\]/);
      if (tokenMatches) {
        unsellableTokenAddresses = tokenMatches[1]
          .split(",")
          .map((token: string) => token.trim())
          .filter((token: string) => /^0x[a-fA-F0-9]{40}$/.test(token));
        unsellableTokens = tokensToCheck.filter((token) =>
          unsellableTokenAddresses.includes(token.address)
        );
        sellableTokens = tokensToCheck.filter(
          (token) => !unsellableTokenAddresses.includes(token.address)
        );
      }

      setUnsellableTokenAddresses(unsellableTokenAddresses);
      setUnsellableTokens(unsellableTokens);
      setSellableTokens(sellableTokens);
    }
  }, [data, error, isPending, toCheckQuote, tokensToCheck]);

  return {
    quote,
    unsellableTokenAddresses,
    unsellableTokens,
    sellableTokens,
    isQuoteLoading: isPending,
    quoteError: error?.data as { detail?: string } | null,
    setTokensToCheck,
    setToCheckQuote,
    quoteStatus,
  };
}
