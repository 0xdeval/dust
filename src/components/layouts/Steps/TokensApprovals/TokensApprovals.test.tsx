import { render, screen } from '@testing-library/react'; // waitFor removed
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest'; // Added Vitest globals
import { TokensApprovals } from './TokensApprovals';
import { useAppStateContext } from '@/context/AppStateContext';
// vi is already imported via vitest globals
import type { Token, SelectedToken, AppState, OperationType } from '@/types'; // OperationType added
import type { SupportedChain } from '@/types/networks'; // For selectedNetwork type

// Mock context
vi.mock('@/context/AppStateContext');
const mockUseAppStateContext = useAppStateContext as jest.Mock;

// Define a more specific type for tokens passed to the mocked TokensStatusesCardsList
interface TokenApprovalStatusDisplay extends Partial<SelectedToken> {
  address: string;
  name?: string;
  isApproved?: boolean;
  isApproving?: boolean;
}

// Mock child components to inspect props or simplify rendering
vi.mock('@/components/layouts/Tokens/TokensStatusesCardsList', () => ({
  TokensStatusesCardsList: vi.fn(({ tokens }: { tokens: Array<TokenApprovalStatusDisplay> }) => (
    <div data-testid="tokens-statuses-list">
      {tokens.map((token) => (
        <div key={token.address} data-testid={`token-status-${token.address}`}>
          {token.name} - Approved: {String(token.isApproved)} - Approving: {String(token.isApproving)}
        </div>
      ))}
    </div>
  )),
}));

// Must use await import for vi.mocked with an async factory
const MockedTokensStatusesCardsList = await vi.importActual<typeof import('@/components/layouts/Tokens/TokensStatusesCardsList')>('@/components/layouts/Tokens/TokensStatusesCardsList')
    .then(mod => vi.mocked(mod.TokensStatusesCardsList));


// Default mock implementations
const mockUpdateState = vi.fn();
const mockSetIsReadyToSell = vi.fn();

const baseTokens: Array<Token> = [ // Changed Token[] to Array<Token>
  { 
    address: '0xtokenA', name: 'Token A', symbol: 'TKNA', decimals: 18, amount: 10, 
    networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uriA', price: 1, 
    rawBalance: BigInt('10000000000000000000') 
  },
  { 
    address: '0xtokenB', name: 'Token B', symbol: 'TKNB', decimals: 18, amount: 20, 
    networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uriB', price: 2, 
    rawBalance: BigInt('20000000000000000000') 
  },
  { 
    address: '0xtokenC', name: 'Token C', symbol: 'TKNC', decimals: 18, amount: 30, 
    networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uriC', price: 3, 
    rawBalance: BigInt('30000000000000000000') 
  },
];

// Helper to create SelectedToken from Token, assuming isSelected is true for this step
const toSelectedTokenForApproval = (token: Token): SelectedToken => ({ ...token, isSelected: true });

const mockSelectedNetwork: SupportedChain = {
  id: 1,
  name: 'Ethereum',
  chainId: 1,
  explorerUrl: 'https://etherscan.io',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [''] }, public: { http: [''] } },
  // Add other required SupportedChain properties if any, or make them optional
};

const defaultAppStateMock: Partial<ReturnType<typeof useAppStateContext>> = {
  state: {
    contentHeadline: 'Approve Tokens',
    contentSubtitle: 'Please approve the selected tokens to proceed.',
    contentButtonLabel: 'Proceed',
    // Other AppState properties can be added if needed by ContentHeadline
    // Ensure all required AppState fields are present or correctly typed as optional
    phase: 'APPROVE_TOKENS',
    receivedToken: '0xReceiver',
    selectedTokens: baseTokens.map(toSelectedTokenForApproval),
    approvedTokens: [],
    isReadyToSell: false,
  } as AppState, // Casting to AppState, ensure all required fields are covered
  selectedTokens: baseTokens.map(toSelectedTokenForApproval),
  approvedTokens: [], // Initially empty or partially filled for tests
  updateState: mockUpdateState,
  setIsReadyToSell: mockSetIsReadyToSell,
  phase: 'APPROVE_TOKENS',
  setApprovedTokens: vi.fn(),
  setSelectedTokens: vi.fn(),
  setReceivedToken: vi.fn(),
  selectedNetwork: mockSelectedNetwork, // Used typed object
  setSelectedNetwork: vi.fn(),
  operationType: 'sell' as OperationType, // Used imported OperationType
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
    // Token A (approved)
    const tokenA = receivedTokensProp.find((t: TokenApprovalStatusDisplay) => t.address === '0xtokenA');
    expect(tokenA).toMatchObject({ name: 'Token A', isApproved: true, isApproving: false });
    // Token B (not approved, so should be approving)
    const tokenB = receivedTokensProp.find((t: TokenApprovalStatusDisplay) => t.address === '0xtokenB');
    expect(tokenB).toMatchObject({ name: 'Token B', isApproved: false, isApproving: true });
    // Token C (not approved, so should be approving)
    const tokenC = receivedTokensProp.find((t: TokenApprovalStatusDisplay) => t.address === '0xtokenC');
    expect(tokenC).toMatchObject({ name: 'Token C', isApproved: false, isApproving: true });
  });

  // Test 2: Initial Rendering - All Tokens Approved
  it('should render with proceed button enabled when all tokens are approved', () => {
    const selected: Array<SelectedToken> = [baseTokens[0], baseTokens[1]].map(toSelectedTokenForApproval);
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
    const tokenA = receivedTokensProp.find((t: TokenApprovalStatusDisplay) => t.address === '0xtokenA');
    expect(tokenA).toMatchObject({ isApproved: true, isApproving: false });
    const tokenB = receivedTokensProp.find((t: TokenApprovalStatusDisplay) => t.address === '0xtokenB');
    expect(tokenB).toMatchObject({ isApproved: true, isApproving: false });
  });

  // Test 3: "Proceed" Button Click (When Enabled)
  it('should call setIsReadyToSell and updateState on "Proceed" click if all tokens approved', async () => {
    const selected = [baseTokens[0], baseTokens[1]].map(toSelectedTokenForApproval);
    mockUseAppStateContext.mockReturnValue({
      ...defaultAppStateMock,
      selectedTokens: selected as Array<SelectedToken>,
      approvedTokens: selected as Array<SelectedToken>, // All selected are approved
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
    const selected: Array<SelectedToken> = [baseTokens[0], baseTokens[1]].map(toSelectedTokenForApproval);
    const approved: Array<SelectedToken> = [baseTokens[0]].map(toSelectedTokenForApproval);
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
    const selectedForTest: Array<SelectedToken> = [
      toSelectedTokenForApproval(baseTokens[0]), // Token A
      toSelectedTokenForApproval(baseTokens[1]), // Token B
      toSelectedTokenForApproval(baseTokens[2]), // Token C
    ];
    const approvedForTest: Array<SelectedToken> = [
        toSelectedTokenForApproval(baseTokens[0]) // Only Token A is approved
    ];

    mockUseAppStateContext.mockReturnValue({
      ...defaultAppStateMock,
      selectedTokens: selectedForTest,
      approvedTokens: approvedForTest,
    });

    render(<TokensApprovals />);

    expect(MockedTokensStatusesCardsList).toHaveBeenCalledTimes(1);
    const receivedTokensProp = MockedTokensStatusesCardsList.mock.calls[0][0].tokens;
    
    expect(receivedTokensProp).toHaveLength(3);

    const tokenAData = receivedTokensProp.find((t: TokenApprovalStatusDisplay) => t.address === '0xtokenA');
    expect(tokenAData).toBeDefined();
    expect(tokenAData).toMatchObject({ isApproved: true, isApproving: false });

    const tokenBData = receivedTokensProp.find((t: TokenApprovalStatusDisplay) => t.address === '0xtokenB');
    expect(tokenBData).toBeDefined();
    expect(tokenBData).toMatchObject({ isApproved: false, isApproving: true });

    const tokenCData = receivedTokensProp.find((t: TokenApprovalStatusDisplay) => t.address === '0xtokenC');
    expect(tokenCData).toBeDefined();
    expect(tokenCData).toMatchObject({ isApproved: false, isApproving: true });
  });
});
