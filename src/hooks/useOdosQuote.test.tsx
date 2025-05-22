import { act, renderHook, waitFor } from '@testing-library/react';
import { useOdosQuote } from './useOdosQuote';
import { useApiQuery } from '@/hooks/api/useApiQuery';
import { useAppStateContext } from '@/contexts/AppStateContext';
import { useAccount } from 'wagmi';
import { buildQuoteRequest } from '@/lib/odos/buildBody';
import { Token } from '@/types'; // Assuming Token type is available
import { OdosQuoteResponse, QuoteStatus } from '@/types/odos'; // Assuming these types are available

// Mock dependencies
jest.mock('@/hooks/api/useApiQuery');
jest.mock('@/contexts/AppStateContext');
jest.mock('wagmi');
jest.mock('@/lib/odos/buildBody');

// Define mock types for convenience
const mockUseApiQuery = useApiQuery as jest.Mock;
const mockUseAppStateContext = useAppStateContext as jest.Mock;
const mockUseAccount = useAccount as jest.Mock;
const mockBuildQuoteRequest = buildQuoteRequest as jest.Mock;

const mockUserAddress = '0xTestUserAddress';
const mockReceivedTokenAddress = '0xReceivedTokenAddress';
const mockSelectedNetwork = { id: 1, chainId: 1, name: 'Ethereum' }; // Simplified

const sampleTokens: Token[] = [
  { address: '0xtoken1', name: 'Token One', symbol: 'TKN1', decimals: 18, amount: 1, networkId: 1, networkName: 'Ethereum', type: 'ERC-20' },
  { address: '0xtoken2', name: 'Token Two', symbol: 'TKN2', decimals: 18, amount: 2, networkId: 1, networkName: 'Ethereum', type: 'ERC-20' },
  { address: '0xtoken3', name: 'Token Three', symbol: 'TKN3', decimals: 18, amount: 3, networkId: 1, networkName: 'Ethereum', type: 'ERC-20' },
];

const mockQuoteRequest = {
  chainId: mockSelectedNetwork.chainId,
  inputTokens: [],
  outputTokens: [{ tokenAddress: mockReceivedTokenAddress, proportion: 1 }],
  userAddr: mockUserAddress,
  slippageLimitPercent: 1,
  referralCode: 0, // Replace with actual referral code if any
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
    mockUseAccount.mockReturnValue({ address: mockUserAddress });
    mockBuildQuoteRequest.mockReturnValue(mockQuoteRequest); // Default mock for buildQuoteRequest
    // Default mock for useApiQuery (not enabled initially)
    mockUseApiQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      refetch: jest.fn(),
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
    expect(result.current.quoteStatus).toBe(QuoteStatus.NO_QUOTE);
    expect(result.current.tokensToCheck).toEqual([]);
    expect(result.current.toCheckQuote).toBe(false);
  });

  describe('Setting tokens and triggering quote', () => {
    const mockApiRefetch = jest.fn();

    beforeEach(() => {
      mockApiRefetch.mockClear();
      // Setup useApiQuery to be initially disabled, then enabled upon refetch
      mockUseApiQuery.mockImplementation(({ enabled, queryKey }) => {
        return {
          data: null,
          error: null,
          isLoading: enabled, // isLoading reflects the enabled state for simplicity here
          refetch: mockApiRefetch.mockResolvedValue({ data: { pathId: 'test-path-id' } }), // Mock refetch behavior
          isError: false,
          isSuccess: false,
          // queryKey is also available if needed for assertions
        };
      });
    });

    it('should enable useApiQuery and call refetch when tokens are set and toCheckQuote is true', async () => {
      const { result } = renderHook(() => useOdosQuote());

      act(() => {
        result.current.setTokensToCheck(sampleTokens);
      });
      expect(result.current.tokensToCheck).toEqual(sampleTokens);
      // Should not call refetch yet as toCheckQuote is false
      expect(mockApiRefetch).not.toHaveBeenCalled();
      expect(result.current.isQuoteLoading).toBe(false); // isLoading from useApiQuery (enabled=false)

      act(() => {
        result.current.setToCheckQuote(true);
      });

      expect(result.current.toCheckQuote).toBe(true);
      expect(mockBuildQuoteRequest).toHaveBeenCalledWith(
        sampleTokens,
        mockReceivedTokenAddress,
        mockSelectedNetwork.chainId,
        mockUserAddress
      );
      // Now useApiQuery should be "enabled" by calling refetch
      expect(mockApiRefetch).toHaveBeenCalledTimes(1);
      // isQuoteLoading should reflect the loading state from the (now enabled) useApiQuery
      // In this test, the refetch resolves immediately, so isLoading might be true briefly.
      // We'll check the outcome after waitFor.

      await waitFor(() => expect(result.current.isQuoteLoading).toBe(false));
      // Assuming refetch was successful as per its mock
      expect(result.current.quoteStatus).toBe(QuoteStatus.SUCCESS_QUOTE);
      expect(result.current.quote).toEqual({ pathId: 'test-path-id' }); // Data from refetch mock
      expect(result.current.toCheckQuote).toBe(false); // Should reset after successful fetch
    });

    it('should handle successful quote fetch', async () => {
      const mockSuccessData: OdosQuoteResponse = {
        pathId: 'successful-path-id',
        // ... other OdosQuoteResponse fields
      };
      mockUseApiQuery.mockReturnValue({ // Override default for this test
        data: null, // Initially no data
        error: null,
        isLoading: false,
        refetch: jest.fn().mockResolvedValue({ data: mockSuccessData }),
        isError: false,
        isSuccess: false,
      });
      const { result } = renderHook(() => useOdosQuote());

      act(() => {
        result.current.setTokensToCheck(sampleTokens);
        result.current.setToCheckQuote(true);
      });

      await waitFor(() => {
        expect(result.current.quoteStatus).toBe(QuoteStatus.SUCCESS_QUOTE);
      });
      expect(result.current.quote).toEqual(mockSuccessData);
      expect(result.current.isQuoteLoading).toBe(false);
      expect(result.current.quoteError).toBeNull();
      expect(result.current.toCheckQuote).toBe(false);
      expect(result.current.unsellableTokens).toEqual([]);
      expect(result.current.sellableTokens).toEqual(sampleTokens); // All should be sellable
    });

    it('should handle API error during quote fetch and parse unsellable tokens', async () => {
      const unsellableAddress1 = sampleTokens[0].address; // '0xtoken1'
      const unsellableAddress2 = sampleTokens[2].address; // '0xtoken3'
      const errorMessage = `Tokens [${unsellableAddress1}, ${unsellableAddress2}] are unsellable`;
      const mockError = {
        response: { data: { detail: errorMessage } },
      };

      mockUseApiQuery.mockReturnValue({ // Override default for this test
        data: null,
        error: mockError, // Simulate error
        isLoading: false,
        refetch: jest.fn().mockRejectedValue(mockError), // refetch also rejects
        isError: true,
        isSuccess: false,
      });

      const { result } = renderHook(() => useOdosQuote());

      act(() => {
        result.current.setTokensToCheck(sampleTokens);
        result.current.setToCheckQuote(true);
      });

      await waitFor(() => {
        expect(result.current.quoteStatus).toBe(QuoteStatus.ERROR);
      });

      expect(result.current.quote).toBeNull();
      expect(result.current.isQuoteLoading).toBe(false);
      expect(result.current.quoteError).toBe(errorMessage);
      expect(result.current.toCheckQuote).toBe(false);

      expect(result.current.unsellableTokens).toHaveLength(2);
      expect(result.current.unsellableTokens.find(t => t.address === unsellableAddress1)).toBeDefined();
      expect(result.current.unsellableTokens.find(t => t.address === unsellableAddress2)).toBeDefined();

      expect(result.current.sellableTokens).toHaveLength(1);
      expect(result.current.sellableTokens.find(t => t.address === sampleTokens[1].address)).toBeDefined(); // '0xtoken2'
    });

     it('should handle API error without specific detail message', async () => {
      const genericError = { message: "Network Error" };
       mockUseApiQuery.mockReturnValue({
        data: null,
        error: genericError,
        isLoading: false,
        refetch: jest.fn().mockRejectedValue(genericError),
        isError: true,
        isSuccess: false,
      });

      const { result } = renderHook(() => useOdosQuote());

      act(() => {
        result.current.setTokensToCheck(sampleTokens);
        result.current.setToCheckQuote(true);
      });

      await waitFor(() => expect(result.current.quoteStatus).toBe(QuoteStatus.ERROR));
      expect(result.current.quoteError).toBe("Network Error");
      expect(result.current.unsellableTokens).toEqual([]); // No specific unsellable info
      expect(result.current.sellableTokens).toEqual(sampleTokens); // Assume all sellable if no info
    });

    it('should reset quote to null when setToCheckQuote(true) is called again', async () => {
      const mockSuccessData: OdosQuoteResponse = { pathId: 'first-path-id' };
      const mockRefetch = jest.fn()
        .mockResolvedValueOnce({ data: mockSuccessData }) // First call success
        .mockResolvedValueOnce({ data: { pathId: 'second-path-id' } }); // Second call success

      mockUseApiQuery.mockReturnValue({
        data: null, error: null, isLoading: false, refetch: mockRefetch, isError: false, isSuccess: false,
      });

      const { result } = renderHook(() => useOdosQuote());

      // First quote
      act(() => {
        result.current.setTokensToCheck(sampleTokens);
        result.current.setToCheckQuote(true);
      });
      await waitFor(() => expect(result.current.quoteStatus).toBe(QuoteStatus.SUCCESS_QUOTE));
      expect(result.current.quote).toEqual(mockSuccessData);

      // Trigger new quote check
      act(() => {
        result.current.setToCheckQuote(true);
      });
      // Quote should be reset immediately while loading new one (or before loading if no tokens)
      expect(result.current.quote).toBeNull();
      expect(result.current.quoteStatus).toBe(QuoteStatus.NO_QUOTE); // Or LOADING, depending on exact state update sequence
      expect(result.current.isQuoteLoading).toBe(true); // Assuming refetch is called and sets loading

      await waitFor(() => expect(result.current.quoteStatus).toBe(QuoteStatus.SUCCESS_QUOTE));
      expect(result.current.quote).toEqual({ pathId: 'second-path-id' });
    });
  });
});
