import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TokensSelection } from './TokensSelection'; // Assuming this is the correct path
import { vi } from 'vitest';

// Mock contexts and hooks
vi.mock('@/context/AppStateContext');
vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>();
  return { ...actual, useAccount: vi.fn() };
});
vi.mock('@/hooks/useTokens');
vi.mock('@/hooks/useTokensCheck');
vi.mock('@/hooks/useOdosQuote');
vi.mock('@/utils/actions/tokenApprovals', () => ({
  approveTokensList: vi.fn(),
}));

// Import mocked hooks to type their mock implementations
import { useAppStateContext } from '@/context/AppStateContext';
import { useAccount } from 'wagmi';
import { useTokens } from '@/hooks/useTokens';
import { useTokensCheck } from '@/hooks/useTokensCheck';
import { useOdosQuote } from '@/hooks/useOdosQuote';
import { approveTokensList } from '@/utils/actions/tokenApprovals';
import type { Token, SelectedToken } from '@/types'; // Ensure types are imported

// Default mock implementations
const mockUpdateState = vi.fn();
const mockSetOperationType = vi.fn();
const mockSetSelectedTokensGlobal = vi.fn(); // For AppStateContext
const mockSetApprovedTokensGlobal = vi.fn(); // For AppStateContext
const mockSetTokensToCheckOdos = vi.fn();
const mockSetToCheckQuoteOdos = vi.fn();

const defaultTokens: Token[] = [
  { address: '0xtoken1', name: 'Token One', symbol: 'TKN1', decimals: 18, amount: 10, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri1', price: 1, rawBalance: BigInt('10000000000000000000') },
  { address: '0xtoken2', name: 'Token Two', symbol: 'TKN2', decimals: 18, amount: 20, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri2', price: 2, rawBalance: BigInt('20000000000000000000') },
  { address: '0xtoken3', name: 'Token Three', symbol: 'TKN3', decimals: 18, amount: 30, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri3', price: 3, rawBalance: BigInt('30000000000000000000') },
  { address: '0xtoken4', name: 'Token Four', symbol: 'TKN4', decimals: 18, amount: 40, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri4', price: 4, rawBalance: BigInt('40000000000000000000') },
  { address: '0xtoken5', name: 'Token Five', symbol: 'TKN5', decimals: 18, amount: 50, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri5', price: 5, rawBalance: BigInt('50000000000000000000') },
  { address: '0xtoken6', name: 'Token Six', symbol: 'TKN6', decimals: 18, amount: 60, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri6', price: 6, rawBalance: BigInt('60000000000000000000') },
  { address: '0xtoken7', name: 'Token Seven', symbol: 'TKN7', decimals: 18, amount: 70, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri7', price: 7, rawBalance: BigInt('70000000000000000000') },
];

// Helper to create SelectedToken from Token
const toSelectedToken = (token: Token, isSelected: boolean = false): SelectedToken => ({ ...token, isSelected });

const setupMocks = (mockOverrides: Partial<any> = {}) => {
  (useAppStateContext as jest.Mock).mockReturnValue({
    state: {
      contentHeadline: 'Select Tokens to Sell',
      contentSubtitle: 'Choose tokens from your wallet to sell.',
      contentButtonLabel: 'Get Quote',
      phase: 'SELECT_TOKENS',
      // other AppState properties...
    },
    operationType: 'sell',
    selectedNetwork: { id: 1, name: 'Ethereum', chainId: 1 },
    updateState: mockUpdateState,
    setOperationType: mockSetOperationType,
    setSelectedTokens: mockSetSelectedTokensGlobal,
    setApprovedTokens: mockSetApprovedTokensGlobal,
    ...mockOverrides.appState,
  });

  (useAccount as jest.Mock).mockReturnValue({
    address: '0xMockUserAddress',
    ...mockOverrides.account,
  });

  (useTokens as jest.Mock).mockReturnValue({
    tokens: defaultTokens,
    isLoading: false,
    ...mockOverrides.tokens,
  });

  (useTokensCheck as jest.Mock).mockReturnValue({
    tokensToSell: defaultTokens,
    tokensToBurn: [],
    isPending: false,
    ...mockOverrides.tokensCheck,
  });

  (useOdosQuote as jest.Mock).mockReturnValue({
    quote: null,
    unsellableTokens: [],
    sellableTokens: defaultTokens, // By default, assume all are sellable from Odos perspective initially
    isQuoteLoading: false,
    quoteError: null,
    quoteStatus: 'IDLE',
    setTokensToCheck: mockSetTokensToCheckOdos,
    setToCheckQuote: mockSetToCheckQuoteOdos,
    ...mockOverrides.odosQuote,
  });

  (approveTokensList as jest.Mock).mockResolvedValue(undefined); // Default successful approval
};


// Mock TokensList to allow interaction
// This is a simplified mock. A more robust mock might be needed if specific child component behavior is critical.
vi.mock('@/components/layouts/Tokens/TokensList', () => ({
  TokensList: ({ tokens, onCardSelect, isLoading, isDisabled, disableUnselected }: any) => {
    if (isLoading) return <div>Loading TokensList...</div>;
    if (!tokens || tokens.length === 0) return <div>No tokens in TokensList</div>;
    return (
      <div data-testid="tokens-list">
        {tokens.map((token: SelectedToken) => (
          <div
            key={token.address}
            data-testid={`token-card-${token.address}`}
            onClick={() => {
                // Only allow selection if not disabled and (not unselected-disabled OR this token is already selected)
                if (!isDisabled && (!disableUnselected || token.isSelected)) {
                    onCardSelect(token);
                }
            }}
            style={{
              cursor: (isDisabled || (disableUnselected && !token.isSelected)) ? 'not-allowed' : 'pointer',
              opacity: (isDisabled || (disableUnselected && !token.isSelected)) ? 0.5 : 1,
              border: token.isSelected ? '2px solid blue' : '1px solid black',
              padding: '5px',
              margin: '5px',
            }}
          >
            {token.name} - {token.symbol} - Selected: {token.isSelected ? 'Yes' : 'No'}
          </div>
        ))}
      </div>
    );
  },
}));

// Mock ContentTabs for tab interaction
vi.mock('@/components/layouts/Content/ContentTabs/ContentTabs', () => ({
    ContentTabs: ({ handleSellClickTab, handleBurnClickTab, operationType, renderTokensList, tokensToSell, tokensToBurn }: any) => (
        <div>
            <button onClick={handleSellClickTab} data-testid="sell-tab">Sell</button>
            <button onClick={handleBurnClickTab} data-testid="burn-tab">Burn</button>
            {operationType === 'sell' ? renderTokensList(tokensToSell) : renderTokensList(tokensToBurn)}
        </div>
    )
}));

// Mock DefaultPopup for popup interaction
vi.mock('@/components/layouts/Popup/DefaultPopup', () => ({
    DefaultPopup: ({ title, subtitle, buttonCta, buttonHandler, isOpen }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="default-popup">
                <h2>{title}</h2>
                <p>{subtitle}</p>
                <button onClick={buttonHandler}>{buttonCta}</button>
            </div>
        );
    }
}));

// Mock Banner
vi.mock('@/components/ui/Banner', () => ({
    Banner: ({ children }: any) => <div data-testid="banner">{children}</div>
}));

// Mock NoTokensStub
vi.mock('@/components/ui/Stubs/NoTokens', () => ({
    NoTokensStub: () => <div data-testid="no-tokens-stub">No Tokens Stub</div>
}));


describe('TokensSelection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clears all mocks
    setupMocks(); // Setup default mocks
  });

  // Test 1: Initial Rendering and Token Display ('Sell' tab)
  it('should render correctly for "sell" operation and display tokens', () => {
    setupMocks({
      appState: { 
        operationType: 'sell',
        state: {
          contentHeadline: 'Select Tokens to Sell',
          contentSubtitle: 'Choose tokens from your wallet to sell.',
          contentButtonLabel: 'Get Quote',
        }
      },
      tokensCheck: { tokensToSell: defaultTokens, tokensToBurn: [] }
    });
    render(<TokensSelection />);

    expect(screen.getByText('Select Tokens to Sell')).toBeInTheDocument();
    expect(screen.getByText('Choose tokens from your wallet to sell.')).toBeInTheDocument();
    expect(screen.getByTestId('tokens-list')).toBeInTheDocument();
    // Check if at least one token from defaultTokens is rendered by our mock
    expect(screen.getByText(/Token One - TKN1/)).toBeInTheDocument(); 
    
    const getQuoteButton = screen.getByRole('button', { name: 'Get Quote' });
    expect(getQuoteButton).toBeInTheDocument();
    expect(getQuoteButton).toBeDisabled(); // Initially disabled as no tokens are selected
  });

  // Test 2: Loading States
  describe('Loading States', () => {
    it('should show loading state when useTokens is loading', () => {
      setupMocks({
        tokens: { isLoading: true, tokens: [] }, // Ensure tokens is empty or not yet defined
        tokensCheck: { tokensToSell: [], tokensToBurn: [], isPending: false }
      });
      render(<TokensSelection />);
      // Our mocked TokensList shows "Loading TokensList..." when isLoading is true
      expect(screen.getByText('Loading TokensList...')).toBeInTheDocument();
    });

    it('should show loading state when useTokensCheck is pending', () => {
      setupMocks({
        tokens: { isLoading: false, tokens: defaultTokens }, // Tokens are loaded
        tokensCheck: { tokensToSell: [], tokensToBurn: [], isPending: true } // But checks are pending
      });
      render(<TokensSelection />);
      // Our mocked TokensList shows "Loading TokensList..." when isLoading is true.
      // The isLoading prop for TokensList is: isFetchingTokens || tokensWithSelection.length === 0 (when not pending)
      // OR isFetchingTokens || isTokensCheckPending (this is how it's implemented in TokensSelection)
      // Let's adjust TokensList mock to reflect this or check for a common loading indicator if one existed.
      // For now, relying on the mocked TokensList behavior.
      // The TokensList's isLoading prop is effectively: (isFetchingTokens || tokensWithSelection.length === 0)
      // The component actually passes: `isLoading={isFetchingTokens || tokensWithSelection.length === 0}` if not isTokensCheckPending
      // and if isTokensCheckPending, it's `isLoading={isFetchingTokens || isTokensCheckPending}`
      // The `renderTokensList` in TokensSelection.tsx passes `isLoading={isFetchingTokens || tokensWithSelection.length === 0}`
      // This needs to be `isLoading={isFetchingTokens || isTokensCheckPending || (tokensWithSelection.length === 0 && !isFetchingTokens && !isTokensCheckPending)}`
      // The component's `renderTokensList` has:
      // `isLoading={isFetchingTokens || tokensWithSelection.length === 0}` -- this will be true if tokensToSell is []
      // Let's ensure tokensToSell is not empty for this specific sub-test, but isTokensCheckPending is true.
      // The actual isLoading prop passed to TokensList is `isFetchingTokens || tokensWithSelection.length === 0` (if using the default tokens)
      // The TokensList component has: `isLoading={isFetchingTokens || isTokensCheckPending || (tokensWithSelection.length === 0 && !isFetchingTokens && !isTokensCheckPending)}`
      // The line in TokensSelection is: `isLoading={isFetchingTokens || tokensWithSelection.length === 0}`
      // This part of the test needs to align with how `TokensList` gets its `isLoading` prop from `TokensSelection`
      // The `renderTokensList` function in `TokensSelection` calculates `isLoading` for `TokensList` as:
      // `isFetchingTokens || tokensWithSelection.length === 0` (simplified from component for this test's purpose as items are not yet selected)
      // The `TokensList` component in `TokensSelection` is passed `isLoading={isFetchingTokens || tokensWithSelection.length === 0}` if not `isTokensCheckPending`.
      // It's `isLoading={isFetchingTokens || isTokensCheckPending}` within the `ContentTabs` based on the current `renderTokensList`.
      // The effective `isLoading` passed to `TokensList` inside `ContentTabs` is:
      // `isFetchingTokens` (from useTokens) OR `isTokensCheckPending` (from useTokensCheck) OR (if tokens for the tab are empty and not already loading).

      // The mocked TokensList receives `isLoading` from `renderTokensList`.
      // `renderTokensList` in `TokensSelection` has `isLoading={isFetchingTokens || tokensWithSelection.length === 0}`
      // This test should verify the `ContentHeadline`'s spinner or loading text.
      // `ContentHeadline` `showSpinner={isQuoteLoading}`. This is not what we're testing here.
      // The `TokensList` `isLoading` prop is set to `isFetchingTokens || tokensWithSelection.length === 0`.
      // If `isTokensCheckPending` is true, `tokensToSell` might be empty initially from `useTokensCheck` hook.
      // Let's assume `ContentTabs` passes `isTokensCheckPending` or similar to `renderTokensList` or `TokensList`.
      // The `ContentTabs` mock currently just calls `renderTokensList`.
      // The `renderTokensList` function in `TokensSelection` uses `isFetchingTokens` and `isTokensCheckPending` in its logic.
      // `if (tokensWithSelection.length === 0 && !isFetchingTokens && !isTokensCheckPending)` shows NoTokensStub.
      // The `isLoading` prop for `TokensList` is `isFetchingTokens || tokensWithSelection.length === 0`.
      // This test is tricky because the loading state for TokensList is complex.
      // Let's focus on the fact that if `isTokensCheckPending` is true, `tokensToSell` (from `useTokensCheck`) might be empty.
      // If `tokensToSell` is empty and `isTokensCheckPending` is true, and `isFetchingTokens` is false,
      // then `tokensWithSelection` will be empty.
      // `TokensList` `isLoading` prop becomes `false || true` which is `true`.
      expect(screen.getByText('Loading TokensList...')).toBeInTheDocument();
    });
  });

  // Test 3: "No Tokens" Stub
  it('should display NoTokensStub when no tokens are available', () => {
    setupMocks({
      tokens: { tokens: [], isLoading: false },
      tokensCheck: { tokensToSell: [], tokensToBurn: [], isPending: false }
    });
    render(<TokensSelection />);
    expect(screen.getByTestId('no-tokens-stub')).toBeInTheDocument();
    // Also check that TokensList itself is not there, or contains the stub.
    // Our mock TokensList renders "No tokens in TokensList" if tokens array is empty.
    // The TokensSelection component's renderTokensList function returns NoTokensStub directly
    // if tokensWithSelection.length === 0 && !isFetchingTokens && !isTokensCheckPending
    // So, we should find 'no-tokens-stub' and not 'tokens-list' if the logic is correct.
    expect(screen.queryByTestId('tokens-list')).not.toBeInTheDocument();
  });

  // Test 4: Token Selection and Action Button Enable
  it('should enable the "Get Quote" button when a token is selected', async () => {
    setupMocks({
      appState: { 
        operationType: 'sell',
        state: {
          contentHeadline: 'Select Tokens to Sell',
          contentButtonLabel: 'Get Quote',
        }
      },
      tokensCheck: { tokensToSell: defaultTokens }
    });
    render(<TokensSelection />);
    
    const getQuoteButton = screen.getByRole('button', { name: 'Get Quote' });
    expect(getQuoteButton).toBeDisabled(); // Initially disabled

    // Simulate selecting the first token
    // The mock TokensList renders items with data-testid={`token-card-${token.address}`}
    const firstTokenCard = screen.getByTestId(`token-card-${defaultTokens[0].address}`);
    await userEvent.click(firstTokenCard);

    // After selection, the button should be enabled
    // This relies on the internal state update from useTokenSelectionManagement and
    // the useEffect in TokensSelection that sets isActionButtonDisabled
    await waitFor(() => {
      expect(getQuoteButton).toBeEnabled();
    });
  });

  // Test 5: Token Selection Limit (Sell Tab)
  it('should handle token selection limit for "sell" operation', async () => {
    setupMocks({
      appState: { 
        operationType: 'sell',
        state: { contentButtonLabel: 'Get Quote' } // Ensure button label is present
      },
      tokensCheck: { tokensToSell: defaultTokens } // Ensure enough tokens are available
    });
    render(<TokensSelection />);

    // Select 6 tokens
    for (let i = 0; i < 6; i++) {
      const tokenCard = screen.getByTestId(`token-card-${defaultTokens[i].address}`);
      await userEvent.click(tokenCard);
    }

    // Assert Banner appears (mocked Banner just renders its children with a testid)
    await waitFor(() => {
        expect(screen.getByTestId('banner')).toBeInTheDocument();
        expect(screen.getByText(/You can select up to 6 tokens to sell at once/)).toBeInTheDocument();
    });
    
    // Check that 6 tokens are marked as selected in our mock (by checking their style or content)
    // This part is tricky with the current mock, as it doesn't re-render with new props easily.
    // We'll rely on the next step: attempting to select a 7th.

    // Attempt to select the 7th token
    const seventhTokenCard = screen.getByTestId(`token-card-${defaultTokens[6].address}`);
    // The mock TokensList's onClick handler has logic to prevent onCardSelect if disableUnselected is true and token is not selected
    // showLimitBanner (which sets disableUnselected) should be true now.
    expect(seventhTokenCard).toHaveStyle('cursor: not-allowed'); // Or check opacity if that's easier with the mock
    await userEvent.click(seventhTokenCard); // This click should be ignored by the selection logic

    // Assert that the 7th token is NOT selected.
    // We can check if the "Get Quote" button's text or some other indicator of selected count reflects 6.
    // The button label in ContentHeadline is `buttonLabel={operationType === "sell" ? state?.contentButtonLabel : "Soon..."}`
    // The button label itself doesn't change with count in this component.
    // We need to verify that `handleCardSelect` in `useTokenSelectionManagement` prevented the 7th selection.
    // This means `selectedTokens.length` inside the hook should remain 6.
    // The `ContentHeadline` button label does not show count.
    // Let's check the state of the 7th token card if possible - it should still be "Selected: No"
    expect(screen.getByTestId(`token-card-${defaultTokens[6].address}`)).toHaveTextContent("Selected: No");


    // Deselect one token (the first one)
    const firstTokenCard = screen.getByTestId(`token-card-${defaultTokens[0].address}`);
    await userEvent.click(firstTokenCard); // This should be allowed as it's a deselection

    // Assert Banner disappears
    await waitFor(() => {
      expect(screen.queryByTestId('banner')).not.toBeInTheDocument();
    });
    
    // Assert 7th token is now selectable (not disabled)
    expect(seventhTokenCard).not.toHaveStyle('cursor: not-allowed');
    expect(seventhTokenCard).toHaveStyle('cursor: pointer'); // Assuming default state is pointer

    // And the first token is now not selected
    expect(screen.getByTestId(`token-card-${defaultTokens[0].address}`)).toHaveTextContent("Selected: No");

  });

  // Test 6: Tab Interaction (Switch to 'Burn' and back)
  it('should switch tabs, reset selections, and update token lists', async () => {
    const tokensToBurnMock = [defaultTokens[0], defaultTokens[1]]; // Sample burnable tokens
    setupMocks({
      appState: { 
        operationType: 'sell', // Initial state
        state: { contentButtonLabel: 'Get Quote' }
      },
      tokensCheck: { 
        tokensToSell: defaultTokens, 
        tokensToBurn: tokensToBurnMock 
      }
    });
    render(<TokensSelection />);

    // 1. Initial state: 'sell' tab active, TokensList shows tokensToSell
    // Select a token on the 'sell' tab
    const firstTokenSellTab = screen.getByTestId(`token-card-${defaultTokens[0].address}`);
    await userEvent.click(firstTokenSellTab);
    await waitFor(() => {
      expect(screen.getByTestId(`token-card-${defaultTokens[0].address}`)).toHaveTextContent("Selected: Yes");
    });
    const getQuoteButton = screen.getByRole('button', { name: 'Get Quote' });
    expect(getQuoteButton).toBeEnabled();


    // 2. Click on 'Burn' tab
    const burnTabButton = screen.getByTestId('burn-tab');
    await userEvent.click(burnTabButton);

    // Assert setOperationType('burn') was called
    expect(mockSetOperationType).toHaveBeenCalledWith('burn');
    
    // Assert selections are reset (button should be disabled again if it's a generic action button)
    // The button label changes for 'burn' tab in ContentHeadline mock (becomes "Soon...")
    // Let's check if the previously selected token is now "Selected: No"
    // Need to wait for the re-render with the new tokens for the burn tab
    await waitFor(() => {
        // Check if tokensToBurn are displayed. Our mock TokensList renders token name.
        // defaultTokens[0] is in tokensToBurnMock
        expect(screen.getByText(/Token One - TKN1/)).toBeInTheDocument(); 
        expect(screen.getByTestId(`token-card-${defaultTokens[0].address}`)).toHaveTextContent("Selected: No");
    });
    // Check if the main action button is now "Soon..." and potentially disabled or hidden
    // The ContentHeadline mock doesn't change the button's enabled/disabled state based on label "Soon..."
    // For "burn" operation, buttonAction is undefined in TokensSelection, so ContentHeadline makes it disabled.
    expect(screen.getByRole('button', { name: 'Soon...' })).toBeDisabled();


    // 3. Click back to 'Sell' tab
    const sellTabButton = screen.getByTestId('sell-tab');
    await userEvent.click(sellTabButton);
    
    // Assert setOperationType('sell') was called
    expect(mockSetOperationType).toHaveBeenCalledWith('sell');

    // Assert TokensList now receives tokensToSell & selections are still reset
    await waitFor(() => {
      expect(screen.getByText(/Token Two - TKN2/)).toBeInTheDocument(); // A token from defaultTokens (tokensToSell)
      expect(screen.getByTestId(`token-card-${defaultTokens[0].address}`)).toHaveTextContent("Selected: No");
    });
    expect(screen.getByRole('button', { name: 'Get Quote' })).toBeDisabled(); // Selections were reset
  });

  // Test 7: "Get Quote" Button Action (No existing quote)
  it('should call Odos quote functions when "Get Quote" is clicked and no quote exists', async () => {
    setupMocks({
      appState: { 
        operationType: 'sell',
        state: { contentButtonLabel: 'Get Quote' }
      },
      tokensCheck: { tokensToSell: defaultTokens },
      odosQuote: { 
        quote: null, // No existing quote
        isQuoteLoading: false, // Initially not loading
        setTokensToCheck: mockSetTokensToCheckOdos,
        setToCheckQuote: mockSetToCheckQuoteOdos,
      }
    });
    render(<TokensSelection />);

    // Select the first token
    const firstTokenCard = screen.getByTestId(`token-card-${defaultTokens[0].address}`);
    await userEvent.click(firstTokenCard);
    
    const getQuoteButton = screen.getByRole('button', { name: 'Get Quote' });
    await waitFor(() => expect(getQuoteButton).toBeEnabled()); // Wait for button to be enabled

    // Click "Get Quote" button
    await userEvent.click(getQuoteButton);

    // Assert Odos hook functions were called
    // The selectedTokens in TokensSelection component is derived from useTokenSelectionManagement
    // which uses defaultTokens[0] after the click.
    const expectedSelectedToken = { ...defaultTokens[0], isSelected: true };
    expect(mockSetTokensToCheckOdos).toHaveBeenCalledWith([expectedSelectedToken]);
    expect(mockSetToCheckQuoteOdos).toHaveBeenCalledWith(true);

    // Assert button shows loading state if isQuoteLoading becomes true
    // Re-render or update mock to simulate loading
    setupMocks({ // Re-setup mocks with isQuoteLoading true
      appState: { 
        operationType: 'sell',
        state: { contentButtonLabel: 'Get Quote' }
      },
      tokensCheck: { tokensToSell: defaultTokens },
      odosQuote: { 
        quote: null,
        isQuoteLoading: true, // Now loading
        setTokensToCheck: mockSetTokensToCheckOdos, // Keep the mock function
        setToCheckQuote: mockSetToCheckQuoteOdos,   // Keep the mock function
        // Simulate that this token is still selected when component re-evaluates
        // This part is tricky as the actual selection state is internal to useTokenSelectionManagement
      }
    });
    // To correctly test the loading state of the button, we need to ensure
    // that the component re-renders with isQuoteLoading=true.
    // The ContentHeadline component shows "Fetching quote..." when isQuoteLoading is true.
    // The button itself is disabled and shows a spinner via showSpinner prop.
    
    // Instead of re-rendering, let's check if the button's text changes or if a spinner appears
    // The ContentHeadline mock needs to reflect this. For now, we check if it's disabled.
    // The ContentHeadline's `buttonAction` prop is `handleActionButtonClick`.
    // When `isQuoteLoading` is true, `isButtonDisabled` prop of `ContentHeadline` becomes true.
    // The ContentHeadline component in the app would then show a spinner.
    // Our test for ContentHeadline's direct props:
    render(<TokensSelection />); // Re-render with new mocks
    
    // The button is disabled when isQuoteLoading is true
    // We need to ensure the button is re-evaluated with the new loading state
    // This is tricky because the button click has already happened.
    // It's better to test the loading state visual change directly on ContentHeadline,
    // or that the button becomes disabled.
    // The component's ContentHeadline receives `isButtonDisabled={isActionButtonDisabled || isQuoteLoading}`
    // and `showSpinner={isQuoteLoading}`.
    // So if isQuoteLoading is true, button should be disabled.
    await waitFor(() => {
        const updatedGetQuoteButton = screen.getByRole('button', { name: 'Get Quote' });
        expect(updatedGetQuoteButton).toBeDisabled();
        // We'd also check for a spinner if ContentHeadline mock was more detailed or if we query parts of it
        // For now, checking disabled state is a good indicator.
        // The text 'Fetching quote...' is passed as `loadingText` to `ContentHeadline`.
        // We'd need to ensure our `ContentHeadline` mock renders this or that `ContentHeadline` itself is tested.
        // Let's assume the actual `ContentHeadline` handles `loadingText`.
    });
  });

  // Test 8: Action Button with Existing Quote (Proceed to Approve)
  it('should proceed to approval when quote exists and action button is clicked', async () => {
    const mockQuoteData = { pathId: 'test-path-id' }; // Simplified quote data
    const selectedTestTokens = [toSelectedToken(defaultTokens[0], true), toSelectedToken(defaultTokens[1], true)];
    
    setupMocks({
      appState: { 
        operationType: 'sell',
        state: { 
            contentHeadline: 'Quote Ready', 
            contentButtonLabel: 'Approve Tokens' // Assuming label changes
        },
        setSelectedTokens: mockSetSelectedTokensGlobal, // from AppStateContext
        updateState: mockUpdateState,
        setApprovedTokens: mockSetApprovedTokensGlobal, // from AppStateContext
        selectedNetwork: { id: 1, name: 'Ethereum', chainId: 1 }
      },
      account: { address: '0xMockUserAddress' },
      tokensCheck: { tokensToSell: defaultTokens }, // All tokens are initially available
      odosQuote: { 
        quote: mockQuoteData,
        isQuoteLoading: false,
        // Simulate that `tokensToApprove` (derived from `selectedTokens` and `unsellableTokens`)
        // results in these two tokens being the ones to approve.
        // This means `unsellableTokens` should be empty for these two tokens.
        unsellableTokens: [], 
        // `sellableTokens` in `useOdosQuote` is not directly used by `approveTokensHandler` logic.
        // `tokensToApprove` in `TokensSelection` is `selectedTokens.filter(...)`.
      }
    });

    render(<TokensSelection />);

    // Simulate tokens already being selected (e.g. from a previous step or by direct manipulation for test setup)
    // This is tricky as selection is managed by useTokenSelectionManagement.
    // For this test, let's assume selection happened and the component re-rendered with a quote.
    // We'll click to select them to ensure the internal state is correct.
    await userEvent.click(screen.getByTestId(`token-card-${defaultTokens[0].address}`));
    await userEvent.click(screen.getByTestId(`token-card-${defaultTokens[1].address}`));

    const approveButton = screen.getByRole('button', { name: 'Approve Tokens' });
    await waitFor(() => expect(approveButton).toBeEnabled());

    // Click "Approve Tokens" button
    await userEvent.click(approveButton);
    
    // Assertions
    // 1. setSelectedTokens (global context) was called with the correct tokens
    //    tokensToApprove is derived from selectedTokens (hook) and unsellableTokens (Odos)
    //    In this setup, selectedTestTokens are the ones selected, and unsellableTokens is empty.
    expect(mockSetSelectedTokensGlobal).toHaveBeenCalledWith(selectedTestTokens);
    
    // 2. updateState("APPROVE_TOKENS") was called
    expect(mockUpdateState).toHaveBeenCalledWith("APPROVE_TOKENS");

    // 3. approveTokensList was called
    //    It's called with (setApprovedTokensGlobal, tokensToApprove, address, aggregatorAddress)
    //    tokensToApprove here should be `selectedTestTokens` as unsellableTokens is empty.
    expect(approveTokensList).toHaveBeenCalledWith(
      mockSetApprovedTokensGlobal,
      selectedTestTokens,
      '0xMockUserAddress',
      expect.any(String) // Aggregator address (result of getAggregatorContractAddress)
    );
  });

  // Test 9: Unsellable Tokens Popup
  it('should display unsellable tokens popup and handle "Sell rest" action', async () => {
    const unsellableMock = [toSelectedToken(defaultTokens[0])]; // TKN1 is unsellable
    const sellableMock = [toSelectedToken(defaultTokens[1], true)];   // TKN2 is sellable and selected
    
    setupMocks({
      appState: { 
        operationType: 'sell',
        state: { contentButtonLabel: 'Get Quote' }, // Initial button label
        setSelectedTokens: mockSetSelectedTokensGlobal,
        updateState: mockUpdateState,
        setApprovedTokens: mockSetApprovedTokensGlobal,
        selectedNetwork: { id: 1, name: 'Ethereum', chainId: 1 }
      },
      account: { address: '0xMockUserAddress' },
      tokensCheck: { tokensToSell: defaultTokens }, // All tokens are initially available
      odosQuote: { 
        quote: null, // No quote from Odos
        isQuoteLoading: false,
        unsellableTokens: unsellableMock, // TKN1
        sellableTokens: sellableMock,     // TKN2 (already "selected" for this scenario)
        // setTokensToCheck and setToCheckQuote will be called by handleActionButtonClick
        setTokensToCheck: mockSetTokensToCheckOdos,
        setToCheckQuote: mockSetToCheckQuoteOdos,
      }
    });

    render(<TokensSelection />);

    // Simulate TKN2 (sellableMock[0]) being selected.
    // The component's internal selectedTokens will be this one.
    // The popup appears if quote is null AND unsellableTokens.length > 0.
    // This happens after an Odos quote attempt that results in some unsellable.
    // So, we need to simulate the flow: select tokens -> click "Get Quote" -> Odos returns unsellable.

    // 1. Select TKN1 and TKN2
    await userEvent.click(screen.getByTestId(`token-card-${defaultTokens[0].address}`)); // Unsellable
    await userEvent.click(screen.getByTestId(`token-card-${defaultTokens[1].address}`)); // Sellable

    const getQuoteButton = screen.getByRole('button', { name: 'Get Quote' });
    await waitFor(() => expect(getQuoteButton).toBeEnabled());
    
    // 2. Click "Get Quote". This will trigger useOdosQuote.
    // We need to ensure useOdosQuote's state updates to reflect the unsellable/sellable scenario *after* this click.
    // The current mock setup for useOdosQuote immediately returns the unsellable/sellable state.
    // The component's useEffect [quote, approveTokensHandler] runs approveTokensHandler if quote exists.
    // The popupContent memo [quote, unsellableTokens, sellableTokens, approveTokensHandler] determines popup.
    // Since quote is null and unsellableTokens has items, popup should show.
    
    // No need to click "Get Quote" if the mocked odosQuote state (unsellableTokens) is already set up
    // The component will re-render with this state, and popupContent memo will show the popup.
    // We need to ensure the `selectedTokens` state within the component matches what `tokensToApprove` would be.
    // `tokensToApprove` is `selectedTokens.filter(t => !unsellableTokens.some(u => u.address === t.address))`
    // So, if TKN1 (unsellable) and TKN2 (sellable) were selected, tokensToApprove would be [TKN2].
    
    // Assert DefaultPopup is displayed
    await waitFor(() => {
      expect(screen.getByTestId('default-popup')).toBeInTheDocument();
      expect(screen.getByText('Some tokens are not sellable')).toBeInTheDocument();
    });

    // Simulate click on popup's "Sell rest" button
    const sellRestButton = screen.getByRole('button', { name: 'Sell rest' });
    await userEvent.click(sellRestButton);

    // Assert approveTokensHandler was triggered correctly
    // setSelectedTokens should be called with only the sellable tokens that were part of the selection
    // In this scenario, tokensToApprove would be sellableMock (TKN2)
    // because only TKN2 was sellable from the initially "selected" TKN1 & TKN2.
    // The `approveTokensHandler` uses `tokensToApprove`.
    // `tokensToApprove` is `selectedTokens.filter(t => !unsellableTokens.some(u => u.address === t.address))`
    // Our `selectedTokens` (from clicking cards) are [TKN1, TKN2].
    // `unsellableTokens` from mock is [TKN1].
    // So, `tokensToApprove` will correctly be [TKN2].
    expect(mockSetSelectedTokensGlobal).toHaveBeenCalledWith([toSelectedToken(defaultTokens[1], true)]);
    expect(mockUpdateState).toHaveBeenCalledWith("APPROVE_TOKENS");
    expect(approveTokensList).toHaveBeenCalledWith(
      mockSetApprovedTokensGlobal,
      [toSelectedToken(defaultTokens[1], true)], // Only the sellable one from the selection
      '0xMockUserAddress',
      expect.any(String)
    );
  });
});
