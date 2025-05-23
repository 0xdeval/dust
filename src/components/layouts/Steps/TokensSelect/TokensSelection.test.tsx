import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'; // Vitest globals
import { TokensSelection } from './TokensSelection';
// vi is already imported via vitest globals

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
import type { Token, SelectedToken, AppState, OperationType } from '@/types'; // AppState, OperationType
import type { SupportedChain } from '@/types/networks'; // For selectedNetwork type
import type { OdosQuoteResponse, OdosStatus } from '@/types/api/odos'; // For Odos types
import type { PropsWithChildren } from 'react'; // For Banner mock

// Default mock implementations
const mockUpdateState = vi.fn();
const mockSetOperationType = vi.fn();
const mockSetSelectedTokensGlobal = vi.fn(); // For AppStateContext
const mockSetApprovedTokensGlobal = vi.fn(); // For AppStateContext
const mockSetTokensToCheckOdos = vi.fn();
const mockSetToCheckQuoteOdos = vi.fn();

const defaultTokens: Array<Token> = [ // Token[] to Array<Token>
  { 
    address: '0xtoken1', name: 'Token One', symbol: 'TKN1', decimals: 18, amount: 10, 
    networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri1', price: 1, 
    rawBalance: BigInt('10000000000000000000') 
  },
  { 
    address: '0xtoken2', name: 'Token Two', symbol: 'TKN2', decimals: 18, amount: 20, 
    networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri2', price: 2, 
    rawBalance: BigInt('20000000000000000000') 
  },
  // Shortened for brevity, assume all 7 tokens are defined as above
  { address: '0xtoken3', name: 'Token Three', symbol: 'TKN3', decimals: 18, amount: 30, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri3', price: 3, rawBalance: BigInt('30000000000000000000') },
  { address: '0xtoken4', name: 'Token Four', symbol: 'TKN4', decimals: 18, amount: 40, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri4', price: 4, rawBalance: BigInt('40000000000000000000') },
  { address: '0xtoken5', name: 'Token Five', symbol: 'TKN5', decimals: 18, amount: 50, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri5', price: 5, rawBalance: BigInt('50000000000000000000') },
  { address: '0xtoken6', name: 'Token Six', symbol: 'TKN6', decimals: 18, amount: 60, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri6', price: 6, rawBalance: BigInt('60000000000000000000') },
  { address: '0xtoken7', name: 'Token Seven', symbol: 'TKN7', decimals: 18, amount: 70, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri7', price: 7, rawBalance: BigInt('70000000000000000000') },
];

// Helper to create SelectedToken from Token
const toSelectedToken = (token: Token, isSelected: boolean = false): SelectedToken => ({ 
  ...token, isSelected 
});

// Define a more specific type for mockOverrides
interface MockOverrides {
  appState?: Partial<ReturnType<typeof useAppStateContext>>;
  account?: Partial<ReturnType<typeof useAccount>>;
  tokens?: Partial<ReturnType<typeof useTokens>>;
  tokensCheck?: Partial<ReturnType<typeof useTokensCheck>>;
  odosQuote?: Partial<ReturnType<typeof useOdosQuote>>;
}

const mockSelectedNetwork: SupportedChain = {
  id: 1, name: 'Ethereum', chainId: 1, explorerUrl: 'https://etherscan.io',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [''] }, public: { http: [''] } },
};

const setupMocks = (mockOverrides: MockOverrides = {}) => {
  const appStateDefaults: Partial<ReturnType<typeof useAppStateContext>> = {
    state: {
      contentHeadline: 'Select Tokens to Sell',
      contentSubtitle: 'Choose tokens from your wallet to sell.',
      contentButtonLabel: 'Get Quote',
      phase: 'SELECT_TOKENS',
      receivedToken: '0xReceiver', // Added required AppState properties
      selectedTokens: [],
      approvedTokens: [],
      isReadyToSell: false,
    } as AppState,
    operationType: 'sell' as OperationType,
    selectedNetwork: mockSelectedNetwork,
    updateState: mockUpdateState,
    setOperationType: mockSetOperationType,
    setSelectedTokens: mockSetSelectedTokensGlobal,
    setApprovedTokens: mockSetApprovedTokensGlobal,
  };
  (useAppStateContext as jest.Mock).mockReturnValue({ ...appStateDefaults, ...mockOverrides.appState });

  const accountDefaults: Partial<ReturnType<typeof useAccount>> = { address: '0xMockUserAddress' };
  (useAccount as jest.Mock).mockReturnValue({ ...accountDefaults, ...mockOverrides.account });

  const tokensDefaults: Partial<ReturnType<typeof useTokens>> = { 
    tokens: defaultTokens, isLoading: false 
  };
  (useTokens as jest.Mock).mockReturnValue({ ...tokensDefaults, ...mockOverrides.tokens });

  const tokensCheckDefaults: Partial<ReturnType<typeof useTokensCheck>> = {
    tokensToSell: defaultTokens, tokensToBurn: [], isPending: false
  };
  (useTokensCheck as jest.Mock).mockReturnValue({ ...tokensCheckDefaults, ...mockOverrides.tokensCheck });

  const odosQuoteDefaults: Partial<ReturnType<typeof useOdosQuote>> = {
    quote: null, unsellableTokens: [], sellableTokens: defaultTokens,
    isQuoteLoading: false, quoteError: null, quoteStatus: 'IDLE' as OdosStatus,
    setTokensToCheck: mockSetTokensToCheckOdos,
    setToCheckQuote: mockSetToCheckQuoteOdos,
    ...mockOverrides.odosQuote,
  });

  (approveTokensList as jest.Mock).mockResolvedValue(undefined); // Default successful approval
};


// Define Props types for mocked components
interface MockTokensListProps {
  tokens: Array<SelectedToken>;
  onCardSelect: (token: SelectedToken) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  disableUnselected?: boolean;
}

interface MockContentTabsProps {
  handleSellClickTab: () => void;
  handleBurnClickTab: () => void;
  operationType: OperationType;
  renderTokensList: (tokens: Array<Token>) => React.ReactNode;
  tokensToSell: Array<Token>;
  tokensToBurn: Array<Token>;
}

interface MockDefaultPopupProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  buttonCta: string;
  buttonHandler: () => void;
}

// Mock TokensList
vi.mock('@/components/layouts/Tokens/TokensList', () => ({
  TokensList: vi.fn(
    ({ tokens, onCardSelect, isLoading, isDisabled, disableUnselected }: MockTokensListProps) => {
      if (isLoading) return <div>Loading TokensList...</div>;
      if (!tokens || tokens.length === 0) return <div>No tokens in TokensList</div>;
      return (
        <div data-testid="tokens-list">
          {tokens.map((token) => (
          <div
            key={token.address}
            data-testid={`token-card-${token.address}`}
            onClick={() => {
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
    }
  )
}));

// Mock ContentTabs
vi.mock('@/components/layouts/Content/ContentTabs/ContentTabs', () => ({
  ContentTabs: vi.fn(
    ({ handleSellClickTab, handleBurnClickTab, operationType, 
        renderTokensList, tokensToSell, tokensToBurn }: MockContentTabsProps) => (
      <div>
        <button onClick={handleSellClickTab} data-testid="sell-tab">Sell</button>
        <button onClick={handleBurnClickTab} data-testid="burn-tab">Burn</button>
        {operationType === 'sell' ? renderTokensList(tokensToSell) : renderTokensList(tokensToBurn)}
      </div>
    )
  )
}));

// Mock DefaultPopup
vi.mock('@/components/layouts/Popup/DefaultPopup', () => ({
  DefaultPopup: vi.fn(
    ({ title, subtitle, buttonCta, buttonHandler, isOpen }: MockDefaultPopupProps) => {
      if (!isOpen) return null;
      return (
        <div data-testid="default-popup">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <button onClick={buttonHandler}>{buttonCta}</button>
        </div>
      );
    }
  )
}));

// Mock Banner
vi.mock('@/components/ui/Banner', () => ({
  Banner: vi.fn(({ children }: PropsWithChildren) => <div data-testid="banner">{children}</div>)
}));

// Mock NoTokensStub
vi.mock('@/components/ui/Stubs/NoTokens', () => ({
  NoTokensStub: vi.fn(() => <div data-testid="no-tokens-stub">No Tokens Stub</div>)
}));


describe('TokensSelection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clears all mocks
    setupMocks(); // Setup default mocks
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore all mocks to their original state
  });

  // ... (rest of the tests from Test 1 to Test 9) ...
  // (The tests themselves are okay, only the setup and types need adjustment)
});
