import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletConnection } from './WalletConnection'; // Assuming this is the correct path
import * as WagmiContext from '@/context/WagmiContext';
import { useAccount } from 'wagmi';
import { useAppStateContext } from '@/context/AppStateContext';
import { vi } from 'vitest'; // Or import { jest } from '@jest/globals'; if using Jest

// Mock WagmiContext modal
const mockModalOpen = vi.fn();
vi.spyOn(WagmiContext, 'modal', 'get').mockReturnValue({ open: mockModalOpen } as any);

// Mock useAccount from wagmi
vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>();
  return {
    ...actual,
    useAccount: vi.fn(),
  };
});
const mockUseAccount = useAccount as jest.Mock;

// Mock useAppStateContext
vi.mock('@/context/AppStateContext', () => ({
  useAppStateContext: vi.fn(),
}));
const mockUseAppStateContext = useAppStateContext as jest.Mock;
const mockUpdateState = vi.fn();

// Default initial state for AppStateContext mock
const defaultAppState = {
  phase: 'CONNECT_WALLET',
  state: {
    contentHeadline: 'CONNECT YOUR WALLET',
    contentSubtitle: 'Connect your wallet to start swapping tokens.',
    contentButtonLabel: 'Connect Wallet',
    // Add other properties from AppState that WalletConnection might implicitly use via ContentHeadline
    receivedToken: '',
    selectedTokens: [],
    approvedTokens: [],
    isReadyToSell: false,
  },
  updateState: mockUpdateState,
  // Provide other context values if WalletConnection or its children directly use them
  isConnected: false, 
  setApprovedTokens: vi.fn(),
  setSelectedTokens: vi.fn(),
  setIsReadyToSell: vi.fn(),
  setReceivedToken: vi.fn(),
  selectedNetwork: {} as any, // Provide a mock or partial object
  setSelectedNetwork: vi.fn(),
  operationType: 'swap' as any,
  setOperationType: vi.fn(),
};

describe('WalletConnection Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockModalOpen.mockClear();
    mockUseAccount.mockReset();
    mockUseAppStateContext.mockReset();
    mockUpdateState.mockClear();

    // Default implementations
    mockUseAccount.mockReturnValue({ isConnected: false, address: undefined, chain: undefined });
    mockUseAppStateContext.mockReturnValue(defaultAppState);
  });

  // Test 1: Initial Rendering (Wallet Not Connected)
  it('should render correctly when wallet is not connected', () => {
    render(<WalletConnection />);

    expect(screen.getByText('CONNECT YOUR WALLET')).toBeInTheDocument();
    expect(screen.getByText('Connect your wallet to start swapping tokens.')).toBeInTheDocument();
    
    const connectButton = screen.getByRole('button', { name: 'Connect Wallet' });
    expect(connectButton).toBeInTheDocument();
    expect(connectButton).toBeEnabled();

    // Check for FaWallet icon (this might need a more specific selector or test ID if there are multiple SVGs)
    // For now, assuming the button contains "Connect Wallet" text which is sufficient for button identification.
    // Checking for an icon specifically can be brittle.
    // If an icon is visually important, it might have a title or aria-label.
    // Let's assume ContentHeadline renders the icon visually but it's not critical for this test to find the specific SVG.
  });

  // Test 2: "Connect Wallet" Button Click
  it('should call modal.open when "Connect Wallet" button is clicked', async () => {
    render(<WalletConnection />);
    
    const connectButton = screen.getByRole('button', { name: 'Connect Wallet' });
    await userEvent.click(connectButton);

    expect(mockModalOpen).toHaveBeenCalledTimes(1);
  });

  // Test 3: Automatic State Update When Wallet is Already Connected
  it('should call updateState with "SELECT_TOKENS" if wallet is already connected', async () => {
    mockUseAccount.mockReturnValue({ isConnected: true, address: '0x123', chain: { id: 1 } });
    // Phase is still CONNECT_WALLET initially
    mockUseAppStateContext.mockReturnValue({
      ...defaultAppState,
      phase: 'CONNECT_WALLET', 
      updateState: mockUpdateState,
    });

    render(<WalletConnection />);

    // The component has an effect that calls updateState.
    // We need to wait for this effect to run and the state update to be called.
    await waitFor(() => {
      expect(mockUpdateState).toHaveBeenCalledWith("SELECT_TOKENS");
    });
  });
  
  // Test 4: Loading State (No App State)
  it('should not render headline or button if app state is null', () => {
    mockUseAppStateContext.mockReturnValue({
      ...defaultAppState,
      state: null, // Simulate no app state / loading state for ContentContainer
    });

    render(<WalletConnection />);

    // ContentContainer's isLoading prop will be true.
    // WalletConnection passes `!state` to `ContentContainer`'s `isLoading` prop.
    // If state is null, isLoading is true. ContentHeadline is inside ContentContainer.
    // Assuming ContentContainer does not render its children when isLoading is true,
    // or ContentHeadline itself checks for state.
    
    // Check that headline and button are NOT present
    expect(screen.queryByText('CONNECT YOUR WALLET')).not.toBeInTheDocument();
    expect(screen.queryByText('Connect your wallet to start swapping tokens.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Wallet' })).not.toBeInTheDocument();
  });
});
