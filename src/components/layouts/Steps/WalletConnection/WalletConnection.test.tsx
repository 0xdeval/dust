import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest'; // Vitest globals
import { WalletConnection } from './WalletConnection';
import * as WagmiContext from '@/context/WagmiContext';
import { useAccount, type UseAccountReturnType } from 'wagmi'; // Import UseAccountReturnType
import { useAppStateContext, type AppStateContextType } from '@/context/AppStateContext'; // Import AppStateContextType
// vi from vitest
import type { AppState, Phase, OperationType, SelectedToken } from '@/types/states'; // Ensure all needed types
import type { SupportedChain } from '@/types/networks';

// Mock WagmiContext modal
const mockModalOpen = vi.fn<[], void>(); // Typed mock
vi.spyOn(WagmiContext, 'modal', 'get').mockReturnValue({ open: mockModalOpen }); // Removed 'as any'

// Mock useAccount from wagmi
vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>();
  return {
    ...actual, // Spread actual module to ensure other exports are preserved
    useAccount: vi.fn(), // Mock only useAccount
  };
});
const mockUseAccount = useAccount as jest.Mock<[], Partial<UseAccountReturnType>>;

// Mock useAppStateContext
vi.mock('@/context/AppStateContext', () => ({
  useAppStateContext: vi.fn(),
}));
const mockUseAppStateContext = useAppStateContext as jest.Mock<[], AppStateContextType>;
const mockUpdateState = vi.fn<(newPhase: Phase) => void>();

// Default initial state for AppStateContext mock
const mockSelectedNetworkDefault: SupportedChain = {
  id: 1, name: 'Ethereum', chainId: 1, explorerUrl: 'https://etherscan.io',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [''] }, public: { http: [''] } },
};

const defaultAppState: AppStateContextType = {
  phase: 'CONNECT_WALLET',
  state: {
    phase: 'CONNECT_WALLET', // Ensure phase is part of AppState type if used directly
    contentHeadline: 'CONNECT YOUR WALLET',
    contentSubtitle: 'Connect your wallet to start swapping tokens.',
    contentButtonLabel: 'Connect Wallet',
    receivedToken: '',
    selectedTokens: [] as Array<SelectedToken>, // Typed empty array
    approvedTokens: [] as Array<SelectedToken>, // Typed empty array
    isReadyToSell: false,
  } as AppState, // Cast to AppState, ensure all required fields are covered
  updateState: mockUpdateState,
  isConnected: false,
  approvedTokens: [] as Array<SelectedToken>,
  setApprovedTokens: vi.fn(),
  selectedTokens: [] as Array<SelectedToken>,
  setSelectedTokens: vi.fn(),
  isReadyToSell: false,
  setIsReadyToSell: vi.fn(),
  receivedToken: '',
  setReceivedToken: vi.fn(),
  selectedNetwork: mockSelectedNetworkDefault,
  setSelectedNetwork: vi.fn(),
  operationType: 'swap' as OperationType,
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
    mockUseAccount.mockReturnValue({ 
      isConnected: false, address: undefined, chain: undefined 
    } as Partial<UseAccountReturnType>); // Cast to satisfy mock type
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
  });

  // Test 2: "Connect Wallet" Button Click
  it('should call modal.open when "Connect Wallet" button is clicked', async () => {
    render(<WalletConnection />);
    
    const connectButton = screen.getByRole('button', { name: 'Connect Wallet' });
    await userEvent.click(connectButton);

    expect(mockModalOpen).toHaveBeenCalledTimes(1);
  });

  // Test 3: Automatic State Update When Wallet is Already Connected
  it('should call updateState with "SELECT_TOKENS" if already connected', async () => {
    mockUseAccount.mockReturnValue({ 
      isConnected: true, address: '0x123', chain: { id: 1 } 
    } as Partial<UseAccountReturnType>);
    
    mockUseAppStateContext.mockReturnValue({
      ...defaultAppState,
      phase: 'CONNECT_WALLET', 
      updateState: mockUpdateState,
    });

    render(<WalletConnection />);

    await waitFor(() => {
      expect(mockUpdateState).toHaveBeenCalledWith("SELECT_TOKENS");
    });
  });
  
  // Test 4: Loading State (No App State)
  it('should not render headline or button if app state is null', () => {
    mockUseAppStateContext.mockReturnValue({
      ...defaultAppState,
      state: null, 
    });

    render(<WalletConnection />);
    
    expect(screen.queryByText('CONNECT YOUR WALLET')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Connect your wallet to start swapping tokens.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect Wallet' })).not.toBeInTheDocument();
  });
});
