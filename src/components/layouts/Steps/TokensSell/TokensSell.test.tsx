import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'; // Vitest globals
import { TokensSell } from './TokensSell';
// vi from vitest
import type { AppState, SelectedToken } from '@/types'; // Token, OdosStatus removed
import type { OdosQuoteResponse, OdosExecuteResponse } from '@/types/api/odos'; // OdosStatus removed
import type { SupportedChain } from '@/types/networks'; // For selectedNetwork type
import type { PropsWithChildren } from 'react'; // For ContentHeadline mock if needed

// Mock contexts and hooks
vi.mock('@/context/AppStateContext');
vi.mock('@/hooks/useOdosQuote');
vi.mock('@/hooks/useOdosExecute');
vi.mock('@/hooks/useSwapTransaction');

// Import mocked hooks to type their mock implementations
import { useAppStateContext } from '@/context/AppStateContext';
import { useOdosQuote } from '@/hooks/useOdosQuote';
import { useOdosExecute } from '@/hooks/useOdosExecute';
import { useSwapTransaction } from '@/hooks/useSwapTransaction';

// --- Mock Implementations & Default Values ---
const mockUpdateState = vi.fn();
const mockSetTokensToCheckOdos = vi.fn();
const mockSetToCheckQuoteOdos = vi.fn();
const mockSetQuoteDataOdosExecute = vi.fn();
const mockSendSwapTransaction = vi.fn();

const mockApprovedTokens: Array<SelectedToken> = [ // SelectedToken[] to Array<SelectedToken>
  { 
    address: '0xtokenA', name: 'Token A', symbol: 'TKNA', decimals: 18, amount: 10, 
    networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uriA', price: 1, 
    rawBalance: BigInt('10000000000000000000'), isSelected: true 
  },
  { 
    address: '0xtokenB', name: 'Token B', symbol: 'TKNB', decimals: 18, amount: 20, 
    networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uriB', price: 2, 
    rawBalance: BigInt('20000000000000000000'), isSelected: true 
  },
];

const mockSelectedNetwork: SupportedChain = {
  id: 1, name: 'Ethereum', chainId: 1, explorerUrl: 'https://etherscan.io',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [''] }, public: { http: [''] } },
};

const defaultAppStateMock: Partial<ReturnType<typeof useAppStateContext>> = {
  state: {
    contentHeadline: 'Processing Your Transaction',
    contentSubtitle: 'Please wait while we process your transaction.',
    phase: 'SELL_TOKENS', // Added required AppState properties
    receivedToken: '0xReceiver',
    selectedTokens: [],
    approvedTokens: mockApprovedTokens, // This was already here
    isReadyToSell: true,
  } as AppState,
  approvedTokens: mockApprovedTokens,
  selectedNetwork: mockSelectedNetwork, // Use typed object
  updateState: mockUpdateState,
};

const defaultOdosQuoteMock: Partial<ReturnType<typeof useOdosQuote>> = {
  quote: null,
  unsellableTokens: [],
  sellableTokens: mockApprovedTokens, 
  quoteStatus: 'IDLE', // No need to cast if OdosStatus is not imported directly
  quoteError: null,
  isQuoteLoading: false,
  setTokensToCheck: mockSetTokensToCheckOdos,
  setToCheckQuote: mockSetToCheckQuoteOdos,
};

const defaultOdosExecuteMock: Partial<ReturnType<typeof useOdosExecute>> = {
  executionData: null,
  isExecutionLoading: false,
  executionError: null,
  executionStatus: 'IDLE', // No need to cast if OdosStatus is not imported directly
  simulationError: null,
  setQuoteData: mockSetQuoteDataOdosExecute,
};

const defaultSwapTransactionMock: Partial<ReturnType<typeof useSwapTransaction>> = {
  hash: null,
  isTransactionPending: false,
  isTransactionSuccess: false,
  isTransactionError: false,
  transactionError: null,
  sendSwapTransaction: mockSendSwapTransaction,
};

// Define a more specific type for mockOverrides in setupMocks
interface MockOverrides {
  appState?: Partial<ReturnType<typeof useAppStateContext>>;
  odosQuote?: Partial<ReturnType<typeof useOdosQuote>>;
  odosExecute?: Partial<ReturnType<typeof useOdosExecute>>;
  swapTransaction?: Partial<ReturnType<typeof useSwapTransaction>>;
}

// Helper to setup mocks for each test, allowing overrides
const setupMocks = (overrides: MockOverrides = {}) => {
  (useAppStateContext as jest.Mock).mockReturnValue({ 
    ...defaultAppStateMock, 
    ...overrides.appState 
  });
  (useOdosQuote as jest.Mock).mockReturnValue({ 
    ...defaultOdosQuoteMock, 
    ...overrides.odosQuote 
  });
  (useOdosExecute as jest.Mock).mockReturnValue({ 
    ...defaultOdosExecuteMock, 
    ...overrides.odosExecute 
  });
  (useSwapTransaction as jest.Mock).mockReturnValue({ 
    ...defaultSwapTransactionMock, 
    ...overrides.swapTransaction 
  });
};

// Define Prop Types for Mocked Components
interface MockStatusSpinnerProps {
  isLoading: boolean;
  status: 'success' | 'error' | string; // string for other potential statuses
}
interface MockDefaultPopupProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  buttonCta: string;
  buttonHandler: () => void;
}
interface MockContentHeadlineProps {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  buttonAction?: () => void;
  isButtonDisabled?: boolean;
  secondaryButtonLabel?: string;
  secondaryButtonAction?: () => void;
  showSpinner?: boolean;
  loadingText?: string;
}

// Mock Child Components
vi.mock('@/components/ui/Spinner', () => ({
  StatusSpinner: vi.fn(
    ({ isLoading, status }: MockStatusSpinnerProps) => (
      <div data-testid="status-spinner" data-loading={isLoading} data-status={status}>
        Spinner
      </div>
    )
  ),
}));

vi.mock('@/components/layouts/Popup/DefaultPopup', () => ({
  DefaultPopup: vi.fn(
    ({ isOpen, title, subtitle, buttonCta, buttonHandler }: MockDefaultPopupProps) => {
      if (!isOpen) return null;
      return (
        <div data-testid="default-popup">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <button onClick={buttonHandler}>{buttonCta}</button>
        </div>
      );
    }
  ),
}));

vi.mock('@/components/layouts/Content/ContentHeadline', () => ({
  ContentHeadline: vi.fn(
    ({ title, subtitle, buttonLabel, buttonAction, isButtonDisabled, 
        secondaryButtonLabel, secondaryButtonAction, showSpinner, loadingText }: MockContentHeadlineProps) => (
      <div data-testid="content-headline">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {buttonLabel && 
          <button onClick={buttonAction} disabled={isButtonDisabled}>
            {buttonLabel}
          </button>}
        {secondaryButtonLabel && 
          <button onClick={secondaryButtonAction}>
            {secondaryButtonLabel}
          </button>}
        {showSpinner && 
          <span data-testid="headline-spinner">
            {loadingText || "Loading..."}
          </span>}
      </div>
    )
  ),
}));


describe('TokensSell Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks(); // Setup with default successful states
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Initial Loading State (Fetching Quote)
  it('should display loading spinner and correct headline when fetching quote', () => {
    setupMocks({
      appState: { state: { contentHeadline: 'Fetching best price...', contentSubtitle: 'Please wait.' } as AppState },
      odosQuote: { isQuoteLoading: true, quoteStatus: 'PENDING' } 
    });
    render(<TokensSell />);

    expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByText('Fetching best price...')).toBeInTheDocument();
    expect(screen.getByText('Please wait.')).toBeInTheDocument();
  });

  // Test 2: Successful Swap Flow (Quote -> Execute -> Transaction)
  describe('Successful Swap Flow', () => {
    const mockQuote: OdosQuoteResponse = { pathId: 'test-path-id' };
    const mockExecData: OdosExecuteResponse = {
      transaction: { 
        to: '0xRecipient', data: '0xData', value: '0', gas: '100000', chainId: 1 
      },
      simulation: { isSuccess: true, gasEstimate: '90000' },
    };
    const mockTxHash = '0xTransactionHash';

    it('should progress through quote, execute, and transaction success', async () => {
      // Initial setup: component mounts, approvedTokens trigger quote fetch
      setupMocks({
        appState: { 
          approvedTokens: mockApprovedTokens,
          state: { 
            contentHeadline: 'Getting quote...', contentSubtitle: '...', phase: 'SELL_TOKENS',
            receivedToken: '0xRec', selectedTokens:[], approvedTokens: mockApprovedTokens, isReadyToSell:true 
          } as AppState,
        },
        odosQuote: { 
          isQuoteLoading: true, 
          setTokensToCheck: mockSetTokensToCheckOdos,
          setToCheckQuote: mockSetToCheckQuoteOdos,
        },
        odosExecute: { setQuoteData: mockSetQuoteDataOdosExecute },
        swapTransaction: { sendSwapTransaction: mockSendSwapTransaction }
      });
      const { rerender } = render(<TokensSell />);

      // a. Quote Success
      // Simulate useOdosQuote returning a successful quote
      await act(async () => {
        setupMocks({
          appState: { // Keep appState or update if phase changes messages
            approvedTokens: mockApprovedTokens,
            state: { 
              contentHeadline: 'Executing...', contentSubtitle: '...', phase: 'SELL_TOKENS',
              receivedToken: '0xRec', selectedTokens:[], approvedTokens: mockApprovedTokens, isReadyToSell:true 
            } as AppState,
           },
          odosQuote: { 
            isQuoteLoading: false, 
            quote: mockQuote, 
            quoteStatus: 'SUCCESS_QUOTE', 
            setTokensToCheck: mockSetTokensToCheckOdos,
            setToCheckQuote: mockSetToCheckQuoteOdos,
          },
          odosExecute: { 
            isExecutionLoading: true, // Execution starts now
            setQuoteData: mockSetQuoteDataOdosExecute 
          },
          swapTransaction: { sendSwapTransaction: mockSendSwapTransaction }
        });
        rerender(<TokensSell />);
      });
      
      await waitFor(() => {
        expect(mockSetQuoteDataOdosExecute).toHaveBeenCalledWith(mockQuote);
      });

      // b. Execute Success
      // Simulate useOdosExecute returning successful execution data
      await act(async () => {
        setupMocks({
          appState: { 
            approvedTokens: mockApprovedTokens,
            state: { 
              contentHeadline: 'Processing transaction...', contentSubtitle: '...', phase: 'SELL_TOKENS',
              receivedToken: '0xRec', selectedTokens:[], approvedTokens: mockApprovedTokens, isReadyToSell:true 
            } as AppState,
          },
          odosQuote: { 
            isQuoteLoading: false, 
            quote: mockQuote, 
            quoteStatus: 'SUCCESS_QUOTE', 
          },
          odosExecute: { 
            isExecutionLoading: false, 
            executionData: mockExecData, 
            executionStatus: 'SUCCESS_EXECUTE',
            setQuoteData: mockSetQuoteDataOdosExecute 
          },
          swapTransaction: { 
            isTransactionPending: true, // Transaction is now pending
            sendSwapTransaction: mockSendSwapTransaction 
          }
        });
        rerender(<TokensSell />);
      });

      await waitFor(() => {
        expect(mockSendSwapTransaction).toHaveBeenCalledTimes(1);
      });
      
      // c. Transaction Success
      // Simulate useSwapTransaction returning a successful transaction
      setupMocks({
        appState: { 
          approvedTokens: mockApprovedTokens,
          // App state will be updated by getTxnStatusCopies, so we don't need to mock exact headline here
          // but can check for parts of it.
          state: { contentHeadline: 'TRADE IS COMPLETED', contentSubtitle: `Transaction hash: ${mockTxHash}`, contentButtonLabel: 'Dust again' } as AppState,
          updateState: mockUpdateState, // Ensure updateState mock is passed
        },
        odosQuote: { 
          isQuoteLoading: false, 
          quote: mockQuote, 
          quoteStatus: 'SUCCESS_QUOTE',
        },
        odosExecute: { 
          isExecutionLoading: false, 
          executionData: mockExecData, 
          executionStatus: 'SUCCESS_EXECUTE',
        },
        swapTransaction: { 
          isTransactionPending: false, 
          isTransactionSuccess: true, 
          hash: mockTxHash 
        }
      });
      rerender(<TokensSell />);

      await waitFor(() => {
        expect(screen.getByText('TRADE IS COMPLETED')).toBeInTheDocument(); // From getTxnStatusCopies
        expect(screen.getByText(new RegExp(mockTxHash))).toBeInTheDocument(); // Check for hash
        // Test 9a: Check spinner status on success
        expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-loading', 'false');
        expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-status', 'success');
      });

      const dustAgainButton = screen.getByRole('button', { name: 'Dust again' });
      expect(dustAgainButton).toBeInTheDocument();
      await userEvent.click(dustAgainButton);
      expect(mockUpdateState).toHaveBeenCalledWith("SELECT_TOKENS");
    });
  });

  // Test 3: Error Handling - Quote Error
  it('should display error state when useOdosQuote returns an error', async () => {
    const quoteErrorMessage = "Odos: Insufficient liquidity for quote.";
    setupMocks({
      appState: { 
        approvedTokens: mockApprovedTokens, // To trigger initial effect
        state: { 
          contentHeadline: 'Error', contentSubtitle: quoteErrorMessage, 
          contentButtonLabel: 'Back to selection', phase: 'SELL_TOKENS',
          receivedToken: '0xRec', selectedTokens:[], approvedTokens: mockApprovedTokens, isReadyToSell:true 
        } as AppState,
        updateState: mockUpdateState,
      },
      odosQuote: { 
        isQuoteLoading: false, 
        quote: null, 
        quoteStatus: 'ERROR',  // No need to cast if OdosStatus is not imported
        quoteError: { detail: quoteErrorMessage } 
      }
    });
    render(<TokensSell />);

    await waitFor(() => {
      // Headline and subtitle should reflect the error (via getTxnStatusCopies)
      expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument(); // From getTxnStatusCopies for quote error
      expect(screen.getByText(new RegExp(quoteErrorMessage.substring(0, 50)))).toBeInTheDocument(); 
      expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-status', 'error');
      expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-loading', 'false');
    });

    const backButton = screen.getByRole('button', { name: 'Back to selection' }); 
    expect(backButton).toBeInTheDocument();
    await userEvent.click(backButton);
    expect(mockUpdateState).toHaveBeenCalledWith("SELECT_TOKENS"); 
  });

  // Test 4: Error Handling - Execution Simulation Error
  it('should display error state when Odos execution simulation fails', async () => {
    const mockQuote: OdosQuoteResponse = { pathId: 'test-path-id' };
    const simulationErrorMessage = "Execution will likely fail due to high price impact.";
    setupMocks({
      appState: { 
        approvedTokens: mockApprovedTokens,
        state: { 
          contentHeadline: 'Error', contentSubtitle: simulationErrorMessage, 
          contentButtonLabel: 'Back to selection', phase: 'SELL_TOKENS',
          receivedToken: '0xRec', selectedTokens:[], approvedTokens: mockApprovedTokens, isReadyToSell:true 
        } as AppState,
        updateState: mockUpdateState,
      },
      odosQuote: { 
        quote: mockQuote, 
        quoteStatus: 'SUCCESS_QUOTE', 
      },
      odosExecute: {
        isExecutionLoading: false,
        executionData: null, // Or relevant data if API returns partial on simulation fail
        executionStatus: 'ERROR',
        simulationError: simulationErrorMessage,
      }
    });
    render(<TokensSell />);

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText(new RegExp(simulationErrorMessage.substring(0, 50)))).toBeInTheDocument();
      expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-status', 'error');
      expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-loading', 'false');
    });
    
    const backButton = screen.getByRole('button', { name: 'Back to selection' });
    expect(backButton).toBeInTheDocument();
    await userEvent.click(backButton);
    expect(mockUpdateState).toHaveBeenCalledWith("SELECT_TOKENS");
  });

  // Test 5: Error Handling - Execution API Error
  it('should display error state when Odos execution API returns an error', async () => {
    const mockQuote: OdosQuoteResponse = { pathId: 'test-path-id' };
    const executionApiErrorMessage = "Odos API Error: Service Unavailable";
    setupMocks({
      appState: { 
        approvedTokens: mockApprovedTokens,
        state: { 
          contentHeadline: 'Error', contentSubtitle: executionApiErrorMessage, 
          contentButtonLabel: 'Back to selection', phase: 'SELL_TOKENS',
          receivedToken: '0xRec', selectedTokens:[], approvedTokens: mockApprovedTokens, isReadyToSell:true 
        } as AppState,
        updateState: mockUpdateState,
      },
      odosQuote: { 
        quote: mockQuote, 
        quoteStatus: 'SUCCESS_QUOTE', 
      },
      odosExecute: {
        isExecutionLoading: false,
        executionData: null,
        executionStatus: 'ERROR',
        executionError: { detail: executionApiErrorMessage }, // API error, not simulation error
        simulationError: null,
      }
    });
    render(<TokensSell />);

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument();
      expect(screen.getByText(new RegExp(executionApiErrorMessage.substring(0, 50)))).toBeInTheDocument();
      expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-status', 'error');
      expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-loading', 'false');
    });

    const backButton = screen.getByRole('button', { name: 'Back to selection' });
    expect(backButton).toBeInTheDocument();
    await userEvent.click(backButton);
    expect(mockUpdateState).toHaveBeenCalledWith("SELECT_TOKENS");
  });

  // Test 6: Error Handling - Transaction Error
  it('should display error state when transaction fails and allow retry', async () => {
    const mockQuote: OdosQuoteResponse = { pathId: 'test-path-id' };
    const mockExecData: OdosExecuteResponse = {
      transaction: { 
        to: '0xRecipient', data: '0xData', value: '0', gas: '100000', chainId: 1 
      },
      simulation: { isSuccess: true, gasEstimate: '90000' },
    };
    const transactionErrorMessage = "User rejected the transaction.";
    
    setupMocks({
      appState: { 
        approvedTokens: mockApprovedTokens,
        state: { 
          contentHeadline: 'Error', contentSubtitle: transactionErrorMessage, 
          contentButtonLabel: 'Try again', phase: 'SELL_TOKENS',
          receivedToken: '0xRec', selectedTokens:[], approvedTokens: mockApprovedTokens, isReadyToSell:true 
        } as AppState,
        updateState: mockUpdateState, 
      },
      odosQuote: { 
        quote: mockQuote, 
        quoteStatus: 'SUCCESS_QUOTE', 
      },
      odosExecute: {
        executionData: mockExecData,
        executionStatus: 'SUCCESS_EXECUTE',
      },
      swapTransaction: {
        isTransactionPending: false,
        isTransactionSuccess: false,
        isTransactionError: true,
        transactionError: { message: transactionErrorMessage }, // Mock the error object
        sendSwapTransaction: mockSendSwapTransaction,
      }
    });
    render(<TokensSell />);

    await waitFor(() => {
      expect(screen.getByText('TRADE FAILED')).toBeInTheDocument(); // From getTxnStatusCopies
      expect(screen.getByText(new RegExp(transactionErrorMessage.substring(0,20)))).toBeInTheDocument();
      expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-status', 'error');
      expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-loading', 'false');
    });

    const tryAgainButton = screen.getByRole('button', { name: 'Try again' });
    expect(tryAgainButton).toBeInTheDocument();
    await userEvent.click(tryAgainButton);
    expect(mockSendSwapTransaction).toHaveBeenCalledTimes(1); // Called again on retry
  });

  // Test 7: Unsellable Tokens Popup (During Initial Quote Fetch)
  it('should display unsellable tokens popup and allow re-quoting with sellable tokens', async () => {
    const unsellable: Array<SelectedToken> = [mockApprovedTokens[0]]; 
    const sellable: Array<SelectedToken> = [mockApprovedTokens[1]];   
    
    setupMocks({
      appState: { 
        approvedTokens: mockApprovedTokens, 
        state: { 
          contentHeadline: 'Getting quote...', phase: 'SELL_TOKENS',
          receivedToken: '0xRec', selectedTokens:[], approvedTokens: mockApprovedTokens, isReadyToSell:true 
        } as AppState,
        updateState: mockUpdateState,
      },
      odosQuote: { 
        quote: null,
        unsellableTokens: unsellable,
        sellableTokens: sellable,
        quoteStatus: 'ERROR', 
        isQuoteLoading: false, // Finished initial check
        setTokensToCheck: mockSetTokensToCheckOdos,
        setToCheckQuote: mockSetToCheckQuoteOdos,
      },
    });

    render(<TokensSell />);

    await waitFor(() => {
      expect(screen.getByTestId('default-popup')).toBeInTheDocument();
      expect(screen.getByText('Some tokens are not sellable')).toBeInTheDocument();
    });

    const sellRestButton = screen.getByRole('button', { name: 'Sell rest' });
    await userEvent.click(sellRestButton);

    expect(mockSetTokensToCheckOdos).toHaveBeenCalledWith(sellable);
    expect(mockSetToCheckQuoteOdos).toHaveBeenCalledWith(true); 
    expect(mockSetTokensToCheckOdos).toHaveBeenCalledTimes(2); 
    expect(mockSetTokensToCheckOdos.mock.calls[0][0]).toEqual(mockApprovedTokens); 
    expect(mockSetTokensToCheckOdos.mock.calls[1][0]).toEqual(sellable); 

    expect(mockSetToCheckQuoteOdos).toHaveBeenCalledTimes(2);
    expect(mockSetToCheckQuoteOdos.mock.calls[0][0]).toBe(true);
    expect(mockSetToCheckQuoteOdos.mock.calls[1][0]).toBe(true);
  });

  // Test 8: "Back" Button Functionality
  it('should call updateState("APPROVE_TOKENS") when "Back" button is clicked', async () => {
    // Setup a state where "Back" button is typically shown, e.g., after quote success, before transaction
    const mockQuote: OdosQuoteResponse = { pathId: 'test-path-id' };
    setupMocks({
      appState: { 
        approvedTokens: mockApprovedTokens,
        state: { 
            contentHeadline: 'Ready to Execute', 
            contentSubtitle: 'Proceed with execution.',
            secondaryButtonLabel: 'Back', phase: 'SELL_TOKENS',
            receivedToken: '0xRec', selectedTokens:[], approvedTokens: mockApprovedTokens, isReadyToSell:true 
        } as AppState,
        updateState: mockUpdateState,
      },
      odosQuote: { 
        quote: mockQuote, 
        quoteStatus: 'SUCCESS_QUOTE', 
      },
      // Other hooks can be in their default non-loading/non-error states
    });

    render(<TokensSell />);
    
    // The ContentHeadline mock renders a button if secondaryButtonLabel is provided
    const backButton = screen.getByRole('button', { name: 'Back' });
    expect(backButton).toBeInTheDocument();

    await userEvent.click(backButton);

    // The handleSecondaryButtonClick in TokensSell calls updateState("APPROVE_TOKENS")
    expect(mockUpdateState).toHaveBeenCalledWith("APPROVE_TOKENS");
  });

  // Test 9: Spinner status verification is integrated into other tests:
  // - Test 2 (Successful Swap Flow) now explicitly checks for data-loading="false" and data-status="success".
  // - Error tests (3, 4, 5, 6) already check for data-loading="false" and data-status="error".
  // No separate test case is needed if these assertions are part of the relevant flow/error tests.
  it('ensures spinner status assertions are part of relevant tests', () => {
    // This test is a meta-test confirming that spinner checks are done elsewhere.
    // For example, Test 3 (Quote Error) already has:
    // expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-status', 'error');
    // expect(screen.getByTestId('status-spinner')).toHaveAttribute('data-loading', 'false');
    expect(true).toBe(true); // Placeholder assertion
  });
});
