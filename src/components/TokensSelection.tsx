import React, { useEffect, useState } from "react";
import { useTokenSelectionManagement } from "@/hooks/useTokenSelectionManagement";
import { useAppStateContext } from "@/context/AppStateContext"; // Assuming path
import { useTokens } from "@/hooks/useTokens"; // Assuming path
import type { Token, SelectedToken, OperationType } from "@/types"; // Assuming path
import { Button } from "@/components/ui/Button"; // Assuming path
import { TokensList } from "@/components/layouts/Tokens/TokensList"; // Assuming path

// Dummy component to simulate TokenCard
const TokenCard: React.FC<{ token: SelectedToken; onCardSelect: (token: SelectedToken) => void; isSelected: boolean }> = ({
  token,
  onCardSelect,
  isSelected,
}) => (
  <div
    onClick={() => onCardSelect(token)}
    style={{ border: isSelected ? "2px solid blue" : "1px solid grey", margin: "5px", padding: "10px", cursor: "pointer" }}
  >
    {token.name} ({token.symbol}) - {isSelected ? "Selected" : "Not Selected"}
  </div>
);

export const TokensSelection: React.FC = () => {
  const { operationType, updateState, setSelectedTokens: setGlobalSelectedTokens } = useAppStateContext();
  const { tokens: initialTokens, isLoading: isLoadingTokens } = useTokens(); // Assuming useTokens provides the initial list

  const {
    sessionSelectedTokens,
    selectedTokens,
    handleCardSelect,
    resetSelectedTokens,
  } = useTokenSelectionManagement({
    initialTokens: initialTokens || [], // Ensure initialTokens is not undefined
    operationType: operationType as OperationType, // Cast if necessary, ensure operationType is valid
  });

  const [isActionButtonDisabled, setIsActionButtonDisabled] = useState(true);
  const [tokensToApprove, setTokensToApprove] = useState<SelectedToken[]>([]);

  // Effect to update isActionButtonDisabled based on selectedTokens from the hook
  useEffect(() => {
    setIsActionButtonDisabled(selectedTokens.length === 0);
  }, [selectedTokens]);

  const handleActionButtonClick = () => {
    // Logic for what happens when the main action button is clicked
    // e.g., set tokens to approve, update global state, change phase
    setTokensToApprove(selectedTokens);
    setGlobalSelectedTokens(selectedTokens.map(t => t.address)); // Assuming global state takes addresses
    // updateState("approve"); // Example: move to next phase
    console.log("Selected tokens for next step:", selectedTokens);
  };

  const approveTokensHandler = (approvedTokens: Array<string>) => {
    // Logic for handling token approvals
    console.log("Tokens approved:", approvedTokens);
    // updateState("sell"); // Example: move to sell phase after approval
  };

  if (isLoadingTokens) {
    return <div>Loading tokens...</div>;
  }

  return (
    <div>
      <h1>Select Tokens ({operationType})</h1>
      <Button onClick={resetSelectedTokens} variant="outline">
        Reset Selection
      </Button>

      {/* Conditional rendering based on sessionSelectedTokens */}
      {sessionSelectedTokens.length > 0 ? (
        <TokensList
          tokens={sessionSelectedTokens}
          onCardSelect={handleCardSelect}
          isLoading={false} // Assuming TokensList takes this prop
          cols={3} // Assuming TokensList takes this prop
        />
      ) : (
        <div>No tokens available for selection.</div>
      )}
      
      {/* Placeholder for how TokenCard might be used if TokensList wasn't available */}
      {/* <div style={{ display: "flex", flexWrap: "wrap" }}>
        {sessionSelectedTokens.map((token) => (
          <TokenCard
            key={token.address}
            token={token}
            onCardSelect={handleCardSelect}
            isSelected={token.isSelected}
          />
        ))}
      </div> */}

      <div style={{ marginTop: "20px" }}>
        <Button
          onClick={handleActionButtonClick}
          disabled={isActionButtonDisabled}
        >
          Proceed with {selectedTokens.length} Token(s)
        </Button>
      </div>

      {/* Example of how tokensToApprove and approveTokensHandler might be used */}
      {/* This part would typically be in a different component/step (e.g., ApproveStep) */}
      {tokensToApprove.length > 0 && (
        <div style={{ marginTop: "20px", border: "1px solid green", padding: "10px" }}>
          <h3>Approval Section (Conceptual)</h3>
          <p>Tokens to approve: {tokensToApprove.map(t => t.symbol).join(", ")}</p>
          <Button onClick={() => approveTokensHandler(tokensToApprove.map(t => t.address))}>
            Approve Selected Tokens
          </Button>
        </div>
      )}
    </div>
  );
};
