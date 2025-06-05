import { useState, useEffect, useMemo, useCallback } from "react";
import type { Token, SelectedToken, OperationType } from "@/types";

interface UseTokenSelectionManagementParams {
  initialTokens: Array<Token>;
  operationType: OperationType;
}

export const useTokenSelectionManagement = ({
  initialTokens,
  operationType,
}: UseTokenSelectionManagementParams) => {
  const [sessionSelectedTokens, setSessionSelectedTokens] = useState<Array<SelectedToken>>([]);

  // Effect to initialize sessionSelectedTokens based on initialTokens
  useEffect(() => {
    const initialSelected: Array<SelectedToken> = initialTokens.map((token) => ({
      ...token,
      isSelected: false, // Initially, no tokens are selected
    }));
    setSessionSelectedTokens(initialSelected);
  }, [initialTokens]);

  // Memoized selectedTokens array
  const selectedTokens = useMemo(() => {
    return sessionSelectedTokens.filter((token) => token.isSelected);
  }, [sessionSelectedTokens]);

  // Handle card select logic
  const handleCardSelect = useCallback(
    (token: SelectedToken) => {
      // Use the memoized selectedTokens.length for efficiency
      if (operationType === "sell" && selectedTokens.length >= 6 && !token.isSelected) {
        // TODO: Consider how to show a toast or message for the limit.
        // For now, just preventing selection beyond 6 for "sell".
        console.warn("Cannot select more than 6 tokens for selling.");
        return;
      }

      setSessionSelectedTokens((prevTokens) =>
        prevTokens.map((t) =>
          t.address === token.address ? { ...t, isSelected: !t.isSelected } : t
        )
      );
    },
    // sessionSelectedTokens is not needed directly because setSessionSelectedTokens updater function provides prevTokens.
    // selectedTokens.length depends on sessionSelectedTokens, so it's a more direct dependency here.
    [operationType, selectedTokens.length] 
  );

  // Reset selected tokens logic
  const resetSelectedTokens = useCallback(() => {
    setSessionSelectedTokens((prevTokens) =>
      prevTokens.map((token) => ({ ...token, isSelected: false }))
    );
  }, []); // No dependencies needed as it only uses the updater form of setSessionSelectedTokens

  return {
    sessionSelectedTokens,
    selectedTokens,
    handleCardSelect,
    resetSelectedTokens,
    setSessionSelectedTokens, // Exposing this if needed for more direct manipulation, e.g., "Select All"
  };
};
