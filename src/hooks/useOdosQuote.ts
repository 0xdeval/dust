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
      // Reset unsellable/sellable states when a new check starts
      setUnsellableTokenAddresses([]);
      setUnsellableTokens([]);
      // Initialize sellableTokens with tokensToCheck, assuming they are sellable until an error proves otherwise
      // Or set to [] if you prefer to only populate on successful quote or specific error handling
      setSellableTokens(tokensToCheck); 
      setQuoteStatus("PENDING"); // Indicate that a quote process has started
    }
  }, [toCheckQuote, tokensToCheck]); // tokensToCheck is added because it's used in setSellableTokens

  useEffect(() => {
    if (!toCheckQuote || !quoteRequest) return; // Ensure quoteRequest is also available, aligning with useApiQuery's enabled logic

    if (isPending) { // Explicitly set PENDING when the query is actually running
        setQuoteStatus("PENDING");
        return; // Don't process data/error while pending
    }

    if (data?.data && !error) { // Check !error instead of relying on !isPending implicitly handling error state
      setQuoteStatus("SUCCESS_QUOTE");
      setQuote(data.data as OdosQuoteResponse | null);
      setSellableTokens(tokensToCheck); // On success, all checked tokens were sellable in this context
      setUnsellableTokenAddresses([]);   // Clear any previous unsellable addresses
      setUnsellableTokens([]);           // Clear any previous unsellable tokens
      setToCheckQuote(false);
    } else if (error && (error.data as { detail?: string })?.detail) {
      setQuoteStatus("ERROR");
      setQuote(null);
      setToCheckQuote(false);

      let newUnsellableTokenAddresses: Array<string> = [];
      let newUnsellableTokens: Array<SelectedToken> = [];
      let newSellableTokens: Array<SelectedToken> = tokensToCheck;

      const detail = (error.data as { detail: string }).detail;
      const tokenMatches = detail.match(/\[([^\]]+)\]/);
      if (tokenMatches) {
        newUnsellableTokenAddresses = tokenMatches[1]
          .split(",")
          .map((token: string) => token.trim())
          .filter((token: string) => /^0x[a-fA-F0-9]{40}$/.test(token));
        newUnsellableTokens = tokensToCheck.filter((token) =>
          newUnsellableTokenAddresses.includes(token.address)
        );
        newSellableTokens = tokensToCheck.filter(
          (token) => !newUnsellableTokenAddresses.includes(token.address)
        );
      }

      setUnsellableTokenAddresses(newUnsellableTokenAddresses);
      setUnsellableTokens(newUnsellableTokens);
      setSellableTokens(newSellableTokens);
    } else if (error) { // Handle other types of errors not matching the detail structure
        setQuoteStatus("ERROR");
        setQuote(null);
        setToCheckQuote(false);
        // For generic errors, assume all tokens might be problematic or it's a network issue
        // Depending on desired behavior, you might clear sellableTokens or leave them as is
        setSellableTokens([]); 
        setUnsellableTokens(tokensToCheck); // Or specific error handling
        setUnsellableTokenAddresses(tokensToCheck.map(t => t.address));
    }
    // If no data and no error, and not pending, it might be an initial state or query not enabled.
    // Current logic sets PENDING if query is active. If query finishes disabled, nothing here runs.
  }, [data, error, isPending, toCheckQuote, tokensToCheck, quoteRequest]); // quoteRequest added as a guard

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
