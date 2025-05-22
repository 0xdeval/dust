import { act, renderHook, waitFor } from '@testing-library/react';
import { useTokensCheck } from './useTokensCheck'; // Assuming this is the correct path
import { useAppStateContext } from '@/contexts/AppStateContext';
import { checkTokensSellability } from '@/utils/actions/checkTokensSellability';
import { checkSpamTokens } from '@/utils/actions/checkSpamTokens';
import { Token } from '@/types';

// Mock dependencies
jest.mock('@/contexts/AppStateContext', () => ({
  useAppStateContext: jest.fn(),
}));

jest.mock('@/utils/actions/checkTokensSellability', () => ({
  checkTokensSellability: jest.fn(),
}));

jest.mock('@/utils/actions/checkSpamTokens', () => ({
  checkSpamTokens: jest.fn(),
}));

// Define mock types for convenience
const mockUseAppStateContext = useAppStateContext as jest.Mock;
const mockCheckTokensSellability = checkTokensSellability as jest.Mock;
const mockCheckSpamTokens = checkSpamTokens as jest.Mock;

const mockNetwork = { id: 1, name: 'Ethereum', chainId: 1 };
const mockReceivedTokenAddress = '0xReceivedTokenAddress';

// Sample tokens for testing
const sampleTokens: Token[] = [
  { address: '0xtoken1', name: 'Token One', symbol: 'TKN1', decimals: 18, amount: 1, networkId: 1, networkName: 'Ethereum', type: 'ERC-20' },
  { address: '0xtoken2', name: 'Token Two', symbol: 'TKN2', decimals: 18, amount: 2, networkId: 1, networkName: 'Ethereum', type: 'ERC-20' },
  { address: '0xtoken3', name: 'Token Three', symbol: 'TKN3', decimals: 18, amount: 3, networkId: 1, networkName: 'Ethereum', type: 'ERC-20' },
  { address: '0xtoken4', name: 'Token Four', symbol: 'TKN4', decimals: 18, amount: 4, networkId: 1, networkName: 'Ethereum', type: 'ERC-20' },
];

describe('useTokensCheck', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseAppStateContext.mockReset();
    mockCheckTokensSellability.mockReset();
    mockCheckSpamTokens.mockReset();

    // Default mock implementations
    mockUseAppStateContext.mockReturnValue({
      selectedNetwork: mockNetwork,
      receivedToken: mockReceivedTokenAddress,
    });
    // Default to all tokens being sellable and none being spam
    mockCheckTokensSellability.mockImplementation(async (network, tokens, receivedToken) =>
      tokens.map(token => ({ ...token, isSellable: true }))
    );
    mockCheckSpamTokens.mockImplementation(async (network, tokens) =>
      tokens.map(token => ({ ...token, isSpam: false }))
    );
  });

  it('should initialize with empty arrays and not pending', () => {
    const { result } = renderHook(() => useTokensCheck([]));
    expect(result.current.tokensToSell).toEqual([]);
    expect(result.current.tokensToBurn).toEqual([]);
    expect(result.current.isPending).toBe(false);
  });

  it('should process tokens and categorize them into tokensToSell and tokensToBurn', async () => {
    // Mock sellability and spam checks
    mockCheckTokensSellability.mockImplementation(async (network, tokens, receivedToken) =>
      tokens.map(token => {
        if (token.address === '0xtoken1' || token.address === '0xtoken3') {
          return { ...token, isSellable: true };
        }
        return { ...token, isSellable: false };
      })
    );
    mockCheckSpamTokens.mockImplementation(async (network, tokens) =>
      tokens.map(token => {
        if (token.address === '0xtoken4') {
          return { ...token, isSpam: true };
        }
        return { ...token, isSpam: false };
      })
    );

    const { result } = renderHook(() => useTokensCheck(sampleTokens));

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    // Expected: token1 is sellable, token3 is sellable
    // token2 is not sellable (so burnable), token4 is spam (so burnable)
    expect(result.current.tokensToSell).toHaveLength(2);
    expect(result.current.tokensToSell.find(t => t.address === '0xtoken1')).toBeDefined();
    expect(result.current.tokensToSell.find(t => t.address === '0xtoken3')).toBeDefined();

    expect(result.current.tokensToBurn).toHaveLength(2);
    expect(result.current.tokensToBurn.find(t => t.address === '0xtoken2')).toBeDefined(); // Not sellable
    expect(result.current.tokensToBurn.find(t => t.address === '0xtoken4')).toBeDefined(); // Spam

    expect(mockCheckTokensSellability).toHaveBeenCalledWith(mockNetwork, sampleTokens, mockReceivedTokenAddress);
    expect(mockCheckSpamTokens).toHaveBeenCalledWith(mockNetwork, sampleTokens);
  });

  it('should handle all tokens being sellable', async () => {
    // All sellable, none spam (default mock behavior is already this)
    const { result } = renderHook(() => useTokensCheck(sampleTokens));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.tokensToSell).toHaveLength(sampleTokens.length);
    expect(result.current.tokensToBurn).toHaveLength(0);
  });

  it('should handle all tokens being non-sellable (but not spam)', async () => {
    mockCheckTokensSellability.mockImplementation(async (network, tokens, receivedToken) =>
      tokens.map(token => ({ ...token, isSellable: false }))
    );
    // None spam is default

    const { result } = renderHook(() => useTokensCheck(sampleTokens));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.tokensToSell).toHaveLength(0);
    expect(result.current.tokensToBurn).toHaveLength(sampleTokens.length);
  });

  it('should handle all tokens being spam', async () => {
    mockCheckSpamTokens.mockImplementation(async (network, tokens) =>
      tokens.map(token => ({ ...token, isSpam: true }))
    );
    // Sellability doesn't matter if spam

    const { result } = renderHook(() => useTokensCheck(sampleTokens));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.tokensToSell).toHaveLength(0);
    expect(result.current.tokensToBurn).toHaveLength(sampleTokens.length);
    // Verify isSpam flag is on burned tokens
    result.current.tokensToBurn.forEach(token => expect(token.isSpam).toBe(true));
  });

  it('should re-run checks when input tokens change', async () => {
    const { result, rerender } = renderHook(
      ({ tokens }) => useTokensCheck(tokens),
      { initialProps: { tokens: [sampleTokens[0]] } }
    );

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(mockCheckTokensSellability).toHaveBeenCalledTimes(1);
    expect(mockCheckSpamTokens).toHaveBeenCalledTimes(1);
    expect(result.current.tokensToSell).toHaveLength(1); // Assuming default mock (sellable, not spam)

    const newTokens = [sampleTokens[1], sampleTokens[2]];
    rerender({ tokens: newTokens });

    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(mockCheckTokensSellability).toHaveBeenCalledTimes(2);
    expect(mockCheckSpamTokens).toHaveBeenCalledTimes(2);
    expect(result.current.tokensToSell).toHaveLength(2); // Assuming default mock
  });

  it('should handle empty input tokens array', async () => {
    const { result } = renderHook(() => useTokensCheck([]));

    // Should not be pending as there's nothing to process, or finish quickly
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.tokensToSell).toEqual([]);
    expect(result.current.tokensToBurn).toEqual([]);
    expect(mockCheckTokensSellability).not.toHaveBeenCalled();
    expect(mockCheckSpamTokens).not.toHaveBeenCalled();
  });

  it('should use updated receivedToken from context', async () => {
    const initialReceivedToken = '0xInitialReceiver';
    const updatedReceivedToken = '0xUpdatedReceiver';

    mockUseAppStateContext.mockReturnValue({
      selectedNetwork: mockNetwork,
      receivedToken: initialReceivedToken,
    });

    const { rerender } = renderHook(() => useTokensCheck(sampleTokens));
    await waitFor(() => expect(mockCheckTokensSellability).toHaveBeenCalledWith(mockNetwork, sampleTokens, initialReceivedToken));

    mockUseAppStateContext.mockReturnValue({
      selectedNetwork: mockNetwork,
      receivedToken: updatedReceivedToken,
    });
    // We need to trigger a re-render that would cause the effect in useTokensCheck to re-run.
    // Changing the input tokens is one way, or if the hook explicitly re-runs on context change.
    // For this test, let's assume changing input tokens is the trigger.
    rerender({ tokens: [...sampleTokens] }); // Trigger re-run with a new array instance

    await waitFor(() => expect(mockCheckTokensSellability).toHaveBeenCalledWith(mockNetwork, sampleTokens, updatedReceivedToken));
    expect(mockCheckTokensSellability).toHaveBeenCalledTimes(2);
  });
});
