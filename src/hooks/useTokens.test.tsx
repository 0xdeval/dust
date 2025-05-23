import { act, renderHook, waitFor } from '@testing-library/react';
import { useTokens } from './useTokens';
import { useAccount } from 'wagmi';
import { useAppStateContext } from '@/contexts/AppStateContext';
import { fetchTokens } from '@/lib/blockscout/api';
import { Token } from '@/types'; // Assuming Token type is available

// Mock dependencies
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
}));

jest.mock('@/contexts/AppStateContext', () => ({
  useAppStateContext: jest.fn(),
}));

jest.mock('@/lib/blockscout/api', () => ({
  fetchTokens: jest.fn(),
}));

// Define mock types for convenience
const mockUseAccount = useAccount as jest.Mock;
const mockUseAppStateContext = useAppStateContext as jest.Mock;
const mockFetchTokens = fetchTokens as jest.Mock;

const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
const mockNetwork = { id: 1, name: 'Ethereum', chainId: 1 }; // Simplified Network type

describe('useTokens', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseAccount.mockReset();
    mockUseAppStateContext.mockReset();
    mockFetchTokens.mockReset();

    // Default mock implementations
    mockUseAccount.mockReturnValue({ address: mockAddress, isConnected: true });
    mockUseAppStateContext.mockReturnValue({ selectedNetwork: mockNetwork });
    mockFetchTokens.mockResolvedValue([]); // Default to empty array
  });

  it('should initialize with no tokens and not loading', () => {
    const { result } = renderHook(() => useTokens());
    expect(result.current.tokens).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch and process tokens on initialization', async () => {
    const mockRawTokens = [
      {
        token: {
          address: '0xtoken1',
          name: 'Token One',
          symbol: 'TKN1',
          decimals: 18,
          logo_url: 'http://example.com/tkn1.png',
          type: 'ERC-20',
        },
        value: '1000000000000000000', // 1 TKN1
      },
      {
        token: {
          address: '0xtoken2',
          name: 'Token Two',
          symbol: 'TKN2',
          decimals: 6,
          logo_url: 'http://example.com/tkn2.png',
          type: 'ERC-20',
        },
        value: '5000000', // 5 TKN2
      },
    ];
    const expectedTokens: Token[] = [
      {
        address: '0xtoken1',
        name: 'Token One',
        symbol: 'TKN1',
        decimals: 18,
        logo_url: 'http://example.com/tkn1.png',
        type: 'ERC-20',
        amount: 1, // Processed amount
        networkId: mockNetwork.id,
        networkName: mockNetwork.name,
      },
      {
        address: '0xtoken2',
        name: 'Token Two',
        symbol: 'TKN2',
        decimals: 6,
        logo_url: 'http://example.com/tkn2.png',
        type: 'ERC-20',
        amount: 5, // Processed amount
        networkId: mockNetwork.id,
        networkName: mockNetwork.name,
      },
    ];
    mockFetchTokens.mockResolvedValue(mockRawTokens);

    const { result } = renderHook(() => useTokens());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFetchTokens).toHaveBeenCalledWith(mockAddress, mockNetwork.id.toString());
    expect(result.current.tokens).toEqual(expectedTokens);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors from fetchTokens', async () => {
    const errorMessage = 'Failed to fetch tokens';
    mockFetchTokens.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTokens());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockFetchTokens).toHaveBeenCalledWith(mockAddress, mockNetwork.id.toString());
    expect(result.current.tokens).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should not fetch tokens if address is undefined', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false });
    const { result } = renderHook(() => useTokens());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.tokens).toEqual([]);
    expect(mockFetchTokens).not.toHaveBeenCalled();
  });

  it('should re-fetch tokens when address changes', async () => {
    const { result, rerender } = renderHook(
      ({ address }) => useTokens(),
      { initialProps: { address: mockAddress } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetchTokens).toHaveBeenCalledTimes(1); // Initial fetch

    const newAddress = '0xnewAddress';
    mockUseAccount.mockReturnValue({ address: newAddress, isConnected: true });
    rerender({ address: newAddress });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetchTokens).toHaveBeenCalledTimes(2);
    expect(mockFetchTokens).toHaveBeenCalledWith(newAddress, mockNetwork.id.toString());
  });

  it('should re-fetch tokens when selectedNetwork.id changes', async () => {
    const { result, rerender } = renderHook(
      ({ network }) => useTokens(),
      { initialProps: { network: mockNetwork } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetchTokens).toHaveBeenCalledTimes(1); // Initial fetch

    const newNetwork = { ...mockNetwork, id: 2, name: 'Polygon' };
    mockUseAppStateContext.mockReturnValue({ selectedNetwork: newNetwork });
    rerender({ network: newNetwork });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetchTokens).toHaveBeenCalledTimes(2);
    expect(mockFetchTokens).toHaveBeenCalledWith(mockAddress, newNetwork.id.toString());
  });

  it('should not re-fetch if address and network.id are unchanged', async () => {
    const { result, rerender } = renderHook(() => useTokens());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockFetchTokens).toHaveBeenCalledTimes(1); // Initial fetch

    rerender(); // Rerender with same props

    expect(result.current.isLoading).toBe(false); // Should not start loading again
    expect(mockFetchTokens).toHaveBeenCalledTimes(1); // Still 1, not re-fetched
  });
});
