import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TokensApprovals } from './TokensApprovals'; // Assuming this is the correct path
import { useAppStateContext } from '@/context/AppStateContext';
import { vi } from 'vitest';
import type { Token, SelectedToken, AppState } from '@/types'; // Ensure types are imported

// Mock context
vi.mock('@/context/AppStateContext');
const mockUseAppStateContext = useAppStateContext as jest.Mock;

// Mock child components to inspect props or simplify rendering
vi.mock('@/components/layouts/Tokens/TokensStatusesCardsList', () => ({
  TokensStatusesCardsList: vi.fn(({ tokens }) => (
    <div data-testid="tokens-statuses-list">
      {tokens.map((token: any) => (
        <div key={token.address} data-testid={`token-status-${token.address}`}>
          {token.name} - Approved: {String(token.isApproved)} - Approving: {String(token.isApproving)}
        </div>
      ))}
    </div>
  )),
}));
const MockedTokensStatusesCardsList = vi.mocked(
    (await import('@/components/layouts/Tokens/TokensStatusesCardsList')).TokensStatusesCardsList
  );


// Default mock implementations
const mockUpdateState = vi.fn();
const mockSetIsReadyToSell = vi.fn();

const baseTokens: Token[] = [
  { address: '0xtokenA', name: 'Token A', symbol: 'TKNA', decimals: 18, amount: 10, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uriA', price: 1, rawBalance: BigInt('10000000000000000000') },
  { address: '0xtokenB', name: 'Token B', symbol: 'TKNB', decimals: 18, amount: 20, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uriB', price: 2, rawBalance: BigInt('20000000000000000000') },
  { address: '0xtokenC', name: 'Token C', symbol: 'TKNC', decimals: 18, amount: 30, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uriC', price: 3, rawBalance: BigInt('30000000000000000000') },
];

// Helper to create SelectedToken from Token, assuming isSelected is true for this step
const toSelectedTokenForApproval = (token: Token): SelectedToken => ({ ...token, isSelected: true });

const defaultAppStateMock: Partial<ReturnType<typeof useAppStateContext>> = {
  state: {
    contentHeadline: 'Approve Tokens',
    contentSubtitle: 'Please approve the selected tokens to proceed.',
    contentButtonLabel: 'Proceed',
    // Other AppState properties can be added if needed by ContentHeadline
  } as AppState,
  selectedTokens: baseTokens.map(toSelectedTokenForApproval),
  approvedTokens: [], // Initially empty or partially filled for tests
  updateState: mockUpdateState,
  setIsReadyToSell: mockSetIsReadyToSell,
  // Provide other context values if TokensApprovals or its children directly use them
  phase: 'APPROVE_TOKENS',
  setApprovedTokens: vi.fn(),
  setSelectedTokens: vi.fn(),
  setReceivedToken: vi.fn(),
  selectedNetwork: { id: 1, name: 'Ethereum', chainId: 1 } as any,
  setSelectedNetwork: vi.fn(),
  operationType: 'sell' as any,
  setOperationType: vi.fn(),
  isReadyToSell: false, // default
};

describe('TokensApprovals Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks for each test
    mockUseAppStateContext.mockReturnValue(defaultAppStateMock);
    MockedTokensStatusesCardsList.mockClear(); // Clear calls for the component mock itself
  });

  // Test 1: Initial Rendering - Not All Tokens Approved
  it('should render correctly when not all tokens are approved and disable proceed button', () => {
    const selected = [baseTokens[0], baseTokens[1], baseTokens[2]].map(toSelectedTokenForApproval);
    const approved = [baseTokens[0]].map(toSelectedTokenForApproval); // Only Token A is approved

    mockUseAppStateContext.mockReturnValue({
      ...defaultAppStateMock,
      selectedTokens: selected,
      approvedTokens: approved,
    });

    render(<TokensApprovals />);

    expect(screen.getByText('Approve Tokens')).toBeInTheDocument();
    expect(screen.getByText('Please approve the selected tokens to proceed.')).toBeInTheDocument();
    
    const proceedButton = screen.getByRole('button', { name: 'Proceed' });
    expect(proceedButton).toBeInTheDocument();
    expect(proceedButton).toBeDisabled();

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();

    expect(MockedTokensStatusesCardsList).toHaveBeenCalledTimes(1);
    const receivedTokensProp = MockedTokensStatusesCardsList.mock.calls[0][0].tokens;
    expect(receivedTokensProp).toHaveLength(3);
    // Based on mapTokensWithApprovalStatus logic:
    // Token A (approved)
    expect(receivedTokensProp.find((t:any) => t.address === '0xtokenA')).toMatchObject({ name: 'Token A', isApproved: true, isApproving: false });
    // Token B (not approved, so should be approving)
    expect(receivedTokensProp.find((t:any) => t.address === '0xtokenB')).toMatchObject({ name: 'Token B', isApproved: false, isApproving: true });
    // Token C (not approved, so should be approving)
    expect(receivedTokensProp.find((t:any) => t.address === '0xtokenC')).toMatchObject({ name: 'Token C', isApproved: false, isApproving: true });
  });

  // Test 2: Initial Rendering - All Tokens Approved
  it('should render with proceed button enabled when all tokens are approved', () => {
    const selected = [baseTokens[0], baseTokens[1]].map(toSelectedTokenForApproval);
    // All selected tokens are also in approvedTokens
    mockUseAppStateContext.mockReturnValue({
      ...defaultAppStateMock,
      selectedTokens: selected,
      approvedTokens: selected, 
    });

    render(<TokensApprovals />);

    const proceedButton = screen.getByRole('button', { name: 'Proceed' });
    expect(proceedButton).toBeInTheDocument();
    expect(proceedButton).toBeEnabled();

    expect(MockedTokensStatusesCardsList).toHaveBeenCalledTimes(1);
    const receivedTokensProp = MockedTokensStatusesCardsList.mock.calls[0][0].tokens;
    expect(receivedTokensProp).toHaveLength(2);
    expect(receivedTokensProp.find((t:any) => t.address === '0xtokenA')).toMatchObject({ isApproved: true, isApproving: false });
    expect(receivedTokensProp.find((t:any) => t.address === '0xtokenB')).toMatchObject({ isApproved: true, isApproving: false });
  });

  // Test 3: "Proceed" Button Click (When Enabled)
  it('should call setIsReadyToSell and updateState when "Proceed" is clicked and all tokens are approved', async () => {
    const selected = [baseTokens[0], baseTokens[1]].map(toSelectedTokenForApproval);
    mockUseAppStateContext.mockReturnValue({
      ...defaultAppStateMock,
      selectedTokens: selected,
      approvedTokens: selected, // All selected are approved
      setIsReadyToSell: mockSetIsReadyToSell,
      updateState: mockUpdateState,
    });

    render(<TokensApprovals />);
    
    const proceedButton = screen.getByRole('button', { name: 'Proceed' });
    expect(proceedButton).toBeEnabled(); // Pre-condition

    await userEvent.click(proceedButton);

    expect(mockSetIsReadyToSell).toHaveBeenCalledWith(true);
    expect(mockUpdateState).toHaveBeenCalledWith("SELL_TOKENS");
  });

  // Test 4: "Back" Button Click
  it('should call updateState with "SELECT_TOKENS" when "Back" is clicked', async () => {
    // Setup similar to Test 1 (not all tokens approved, so main button is disabled)
    const selected = [baseTokens[0], baseTokens[1]].map(toSelectedTokenForApproval);
    const approved = [baseTokens[0]].map(toSelectedTokenForApproval);
    mockUseAppStateContext.mockReturnValue({
      ...defaultAppStateMock,
      selectedTokens: selected,
      approvedTokens: approved,
      updateState: mockUpdateState,
      setIsReadyToSell: mockSetIsReadyToSell,
    });

    render(<TokensApprovals />);

    const backButton = screen.getByRole('button', { name: 'Back' });
    expect(backButton).toBeEnabled(); // Pre-condition

    await userEvent.click(backButton);

    expect(mockUpdateState).toHaveBeenCalledWith("SELECT_TOKENS");
    expect(mockSetIsReadyToSell).not.toHaveBeenCalled(); // Or toHaveBeenCalledWith(false) if that's the logic
  });

  // Test 5: Loading State (No App State)
  it('should not render main content if app state is null', () => {
    mockUseAppStateContext.mockReturnValue({
      ...defaultAppStateMock,
      state: null, // Simulate no app state
    });

    render(<TokensApprovals />);

    // ContentContainer's isLoading prop will be true.
    // Assuming ContentContainer does not render its children when isLoading is true.
    expect(screen.queryByText('Approve Tokens')).not.toBeInTheDocument(); // Headline
    expect(screen.queryByRole('button', { name: 'Proceed' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('tokens-statuses-list')).not.toBeInTheDocument();
  });

  // Test 6: Display of Different Approval Statuses in List
  it('should pass correct approval statuses to TokensStatusesCardsList', () => {
    const selectedForTest = [
      toSelectedTokenForApproval(baseTokens[0]), // Token A
      toSelectedTokenForApproval(baseTokens[1]), // Token B
      toSelectedTokenForApproval(baseTokens[2]), // Token C
    ];
    const approvedForTest = [toSelectedTokenForApproval(baseTokens[0])]; // Only Token A is approved

    mockUseAppStateContext.mockReturnValue({
      ...defaultAppStateMock,
      selectedTokens: selectedForTest,
      approvedTokens: approvedForTest,
    });

    render(<TokensApprovals />);

    expect(MockedTokensStatusesCardsList).toHaveBeenCalledTimes(1);
    const receivedTokensProp = MockedTokensStatusesCardsList.mock.calls[0][0].tokens;
    
    expect(receivedTokensProp).toHaveLength(3);

    const tokenAData = receivedTokensProp.find((t:any) => t.address === '0xtokenA');
    expect(tokenAData).toBeDefined();
    expect(tokenAData.isApproved).toBe(true);
    expect(tokenAData.isApproving).toBe(false); // Should not be approving if already approved

    const tokenBData = receivedTokensProp.find((t:any) => t.address === '0xtokenB');
    expect(tokenBData).toBeDefined();
    expect(tokenBData.isApproved).toBe(false);
    expect(tokenBData.isApproving).toBe(true); // Should be in "approving" state

    const tokenCData = receivedTokensProp.find((t:any) => t.address === '0xtokenC');
    expect(tokenCData).toBeDefined();
    expect(tokenCData.isApproved).toBe(false);
    expect(tokenCData.isApproving).toBe(true); // Should be in "approving" state
  });
});
