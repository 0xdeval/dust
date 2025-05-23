import { describe, it, expect, beforeEach, vi } from 'vitest'; // Vitest globals
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOdosQuote } from './useOdosQuote';
import { useApiQuery } from '@/hooks/api/useApiQuery';
import { useAppStateContext, type AppStateContextType } from '@/context/AppStateContext'; // AppStateContextType
import { useAccount, type UseAccountReturnType } from 'wagmi'; // UseAccountReturnType
import { buildQuoteRequest } from '@/lib/odos/buildBody';
import type { Token, SelectedToken } from '@/types'; // SelectedToken for consistency
import type { OdosQuoteResponse, QuoteStatus, OdosOutputToken } from '@/types/api/odos'; // Corrected path
import type { SupportedChain } from '@/types/networks';

// Mock dependencies
vi.mock('@/hooks/api/useApiQuery'); // Changed to vi.mock
vi.mock('@/contexts/AppStateContext'); // Changed to vi.mock
vi.mock('wagmi', async (importOriginal) => { // Ensure wagmi is mocked correctly
  const actual = await importOriginal<typeof import('wagmi')>();
  return {
    ...actual,
    useAccount: vi.fn(),
  };
});
vi.mock('@/lib/odos/buildBody'); // Changed to vi.mock

// Define mock types for convenience
const mockUseApiQuery = useApiQuery as vi.Mock; // Changed to vi.Mock
const mockUseAppStateContext = useAppStateContext as vi.Mock<[], Partial<AppStateContextType>>; // Typed mock
const mockUseAccount = useAccount as vi.Mock<[], Partial<UseAccountReturnType>>; // Typed mock
const mockBuildQuoteRequest = buildQuoteRequest as vi.Mock; // Changed to vi.Mock

const mockUserAddress = '0xTestUserAddress' as `0x${string}`; // Type assertion
const mockReceivedTokenAddress = '0xReceivedTokenAddress' as `0x${string}`; // Type assertion

// Typed mockSelectedNetwork
const mockSelectedNetwork: Partial<SupportedChain> = { 
  id: 1, 
  chainId: 1, 
  name: 'Ethereum' 
};

const sampleTokens: Array<Token> = [ // Token[] to Array<Token>
  { address: '0xtoken1', name: 'Token One', symbol: 'TKN1', decimals: 18, amount: 1, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri1', price:1, rawBalance:1n },
  { address: '0xtoken2', name: 'Token Two', symbol: 'TKN2', decimals: 18, amount: 2, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri2', price:1, rawBalance:1n },
  { address: '0xtoken3', name: 'Token Three', symbol: 'TKN3', decimals: 18, amount: 3, networkId: 1, networkName: 'Ethereum', type: 'ERC-20', logoURI: 'uri3', price:1, rawBalance:1n },
];

const mockQuoteRequest = { // This can be typed with OdosQuoteRequest from '@/types/api/odos' if available
  chainId: mockSelectedNetwork.chainId,
  inputTokens: [],
  outputTokens: [{ tokenAddress: mockReceivedTokenAddress, proportion: 1 }],
  userAddr: mockUserAddress,
  slippageLimitPercent: 1,
  referralCode: 0, 
  disableRFQs: true,
  compact: true,
};

describe('useOdosQuote', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseApiQuery.mockReset();
    mockUseAppStateContext.mockReset();
    mockUseAccount.mockReset();
    mockBuildQuoteRequest.mockReset();

    // Default mock implementations
    mockUseAppStateContext.mockReturnValue({
      receivedToken: mockReceivedTokenAddress,
      selectedNetwork: mockSelectedNetwork,
    });
    mockUseAccount.mockReturnValue({ address: mockUserAddress } as Partial<UseAccountReturnType>);
    mockBuildQuoteRequest.mockReturnValue(mockQuoteRequest); 
    mockUseApiQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      refetch: vi.fn(), // Changed to vi.fn()
      isError: false,
      isSuccess: false,
    });
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useOdosQuote());
    expect(result.current.quote).toBeNull();
    expect(result.current.unsellableTokens).toEqual([]);
    expect(result.current.sellableTokens).toEqual([]);
    expect(result.current.isQuoteLoading).toBe(false);
    expect(result.current.quoteError).toBeNull();
    expect(result.current.quoteStatus).toBe('IDLE' as QuoteStatus); // Use string literal if type not imported
    expect(result.current.tokensToCheck).toEqual([]);
    expect(result.current.toCheckQuote).toBe(false);
  });

  describe('Setting tokens and triggering quote', () => {
    const mockApiRefetch = vi.fn(); // Changed to vi.fn()

    beforeEach(() => {
      mockApiRefetch.mockClear();
      mockUseApiQuery.mockImplementation(({ enabled /* queryKey removed */ }) => { // Removed queryKey from params
        return {
          data: null,
          error: null,
          isLoading: enabled, 
          refetch: mockApiRefetch.mockResolvedValue({ data: { pathId: 'test-path-id' } }), 
          isError: false,
          isSuccess: false,
        };
      });
    });

    it('should call refetch when tokens are set and toCheckQuote is true', async () => {
      const { result } = renderHook(() => useOdosQuote());

      act(() => {
        result.current.setTokensToCheck(sampleTokens as Array<SelectedToken>); // Cast for test
      });
      expect(result.current.tokensToCheck).toEqual(sampleTokens);
      expect(mockApiRefetch).not.toHaveBeenCalled();
      expect(result.current.isQuoteLoading).toBe(false);

      act(() => {
        result.current.setToCheckQuote(true);
      });

      expect(result.current.toCheckQuote).toBe(true);
      expect(mockBuildQuoteRequest).toHaveBeenCalledWith({ // Expect object form
        inputTokens: sampleTokens.map(t => ({ tokenAddress: t.address, amount: t.rawBalance.toString()})),
        outputTokens: [{ tokenAddress: mockReceivedTokenAddress, proportion: 1 }],
        userAddress: mockUserAddress,
        chainId: mockSelectedNetwork.id,
      });
      expect(mockApiRefetch).toHaveBeenCalledTimes(1);

      await waitFor(() => expect(result.current.isQuoteLoading).toBe(false));
      expect(result.current.quoteStatus).toBe('SUCCESS_QUOTE' as QuoteStatus);
      expect(result.current.quote).toEqual({ pathId: 'test-path-id' });
      expect(result.current.toCheckQuote).toBe(false); // Should reset after successful fetch
    });

    it('should handle successful quote fetch', async () => {
      const mockSuccessData: OdosQuoteResponse = {
        pathId: 'successful-path-id', // Ensure all required fields of OdosQuoteResponse are here
        blockNumber: 123,
        gasEstimate: '10000',
        // ... add other required fields
      };
      mockUseApiQuery.mockReturnValue({ 
        data: null, 
        error: null,
        isLoading: false,
        refetch: vi.fn().mockResolvedValue({ data: mockSuccessData }), // vi.fn()
        isError: false,
        isSuccess: false,
      });
      const { result } = renderHook(() => useOdosQuote());

      act(() => {
        result.current.setTokensToCheck(sampleTokens as Array<SelectedToken>); // Cast for test
        result.current.setToCheckQuote(true);
      });

      await waitFor(() => {
        expect(result.current.quoteStatus).toBe('SUCCESS_QUOTE' as QuoteStatus);
      });
      expect(result.current.quote).toEqual(mockSuccessData);
      expect(result.current.isQuoteLoading).toBe(false);
      expect(result.current.quoteError).toBeNull();
      expect(result.current.toCheckQuote).toBe(false);
      expect(result.current.unsellableTokens).toEqual([]);
      expect(result.current.sellableTokens).toEqual(sampleTokens as Array<SelectedToken>); // Cast for test
    });

    it('should handle API error during quote fetch and parse unsellable tokens', async () => {
      const unsellableAddress1 = sampleTokens[0].address; // '0xtoken1'
      const unsellableAddress2 = sampleTokens[2].address; // '0xtoken3'
      const errorMessage = `Tokens [${unsellableAddress1}, ${unsellableAddress2}] are unsellable`;
      const mockError = {
        response: { data: { detail: errorMessage } },
      };

      mockUseApiQuery.mockReturnValue({ 
        data: null,
        error: mockError as any, // Cast error for mock structure
        isLoading: false,
        refetch: vi.fn().mockRejectedValue(mockError), // vi.fn()
        isError: true,
        isSuccess: false,
      });

      const { result } = renderHook(() => useOdosQuote());

      act(() => {
        result.current.setTokensToCheck(sampleTokens as Array<SelectedToken>); // Cast for test
        result.current.setToCheckQuote(true);
      });

      await waitFor(() => {
        expect(result.current.quoteStatus).toBe('ERROR' as QuoteStatus);
      });

      expect(result.current.quote).toBeNull();
      expect(result.current.isQuoteLoading).toBe(false);
      expect(result.current.quoteError).toEqual({ detail: errorMessage }); // Error object is passed
      expect(result.current.toCheckQuote).toBe(false);

      const expectedUnsellable = [sampleTokens[0], sampleTokens[2]];
      const expectedSellable = [sampleTokens[1]];
      expect(result.current.unsellableTokens.map(t=>t.address).sort()).toEqual(expectedUnsellable.map(t=>t.address).sort());
      expect(result.current.sellableTokens.map(t=>t.address).sort()).toEqual(expectedSellable.map(t=>t.address).sort());
    });

     it('should handle API error without specific detail message', async () => {
      const genericError = { message: "Network Error" }; // Simple error
       mockUseApiQuery.mockReturnValue({
        data: null,
        error: genericError as any, // Cast error for mock
        isLoading: false,
        refetch: vi.fn().mockRejectedValue(genericError), // vi.fn()
        isError: true,
        isSuccess: false,
      });

      const { result } = renderHook(() => useOdosQuote());

      act(() => {
        result.current.setTokensToCheck(sampleTokens as Array<SelectedToken>); // Cast for test
        result.current.setToCheckQuote(true);
      });

      await waitFor(() => expect(result.current.quoteStatus).toBe('ERROR' as QuoteStatus));
      expect(result.current.quoteError).toEqual(genericError); // Error object is passed
      // Previous behavior was to keep tokensToCheck as sellableTokens if error structure unknown
      // This was changed in hook to clear sellableTokens and mark all as unsellable for generic errors
      expect(result.current.unsellableTokens.map(t => t.address).sort()).toEqual(sampleTokens.map(t=>t.address).sort());
      expect(result.current.sellableTokens).toEqual([]);
    });

    it('should reset quote when setToCheckQuote(true) is called again', async () => {
      const mockSuccessData1: OdosQuoteResponse = { pathId: 'first-path-id', blockNumber:1, gasEstimate:'1' };
      const mockSuccessData2: OdosQuoteResponse = { pathId: 'second-path-id', blockNumber:2, gasEstimate:'2' };
      const localMockApiRefetch = vi.fn()
        .mockResolvedValueOnce({ data: mockSuccessData1 }) 
        .mockResolvedValueOnce({ data: mockSuccessData2 });

      mockUseApiQuery.mockImplementation(({ enabled }) => ({ // Simplified for this test
        data: null, error: null, isLoading: enabled, refetch: localMockApiRefetch, 
        isError: false, isSuccess: false,
      }));

      const { result } = renderHook(() => useOdosQuote());

      act(() => {
        result.current.setTokensToCheck(sampleTokens as Array<SelectedToken>);
        result.current.setToCheckQuote(true);
      });
      await waitFor(() => expect(result.current.quoteStatus).toBe('SUCCESS_QUOTE' as QuoteStatus));
      expect(result.current.quote).toEqual(mockSuccessData1);

      act(() => {
        result.current.setToCheckQuote(true); // Trigger new quote check
      });
      expect(result.current.quote).toBeNull(); // Should reset immediately
      expect(result.current.quoteStatus).toBe('PENDING' as QuoteStatus); 
      expect(result.current.isQuoteLoading).toBe(true); 

      await waitFor(() => expect(result.current.quoteStatus).toBe('SUCCESS_QUOTE' as QuoteStatus));
      expect(result.current.quote).toEqual(mockSuccessData2);
    });
  });
});
