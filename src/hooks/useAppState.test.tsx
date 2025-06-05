import { describe, it, expect, beforeEach, vi } from 'vitest'; // Vitest globals
import { act, renderHook } from '@testing-library/react';
import { useAppState } from './useAppState';
import { getCopies } from '../utils/getCopies';
import type { SelectedToken, OperationType } from '@/types'; // Import relevant types
import type { SupportedChain } from '@/types/networks';

// Mock getCopies
vi.mock('../utils/getCopies', () => ({
  getCopies: vi.fn(), // Changed to vi.fn()
}));

const mockGetCopies = getCopies as vi.Mock; // Changed to vi.Mock

describe('useAppState', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockGetCopies.mockClear();
  });

  it('should initialize with correct default values', () => {
    // Mock getCopies for initial phase 'swap'
    mockGetCopies.mockReturnValue({
      contentHeadline: 'Initial Headline',
      contentSubtitle: 'Initial Subtitle',
      currentStep: 1,
      totalSteps: 5,
      primaryButtonText: 'Next',
      secondaryButtonText: 'Back',
      showSecondaryButton: false,
      showStepper: true,
    });

    const { result } = renderHook(() => useAppState());

    expect(result.current.phase).toBe('swap');
    expect(result.current.state).toEqual({
      contentHeadline: 'Initial Headline',
      contentSubtitle: 'Initial Subtitle',
      currentStep: 1,
      totalSteps: 5,
      primaryButtonText: 'Next',
      secondaryButtonText: 'Back',
      showSecondaryButton: false,
      showStepper: true,
    });
    expect(result.current.approvedTokens).toEqual([]);
    expect(result.current.isReadyToSell).toBe(false);
    expect(result.current.selectedTokens).toEqual([]);
    expect(result.current.receivedToken).toBe('');
    expect(result.current.selectedNetwork).toBeUndefined();
    expect(result.current.operationType).toBe('swap'); // Assuming 'swap' is the default

    // Verify that getCopies was called with the initial phase
    expect(mockGetCopies).toHaveBeenCalledWith('swap');
  });

  describe('updateState', () => {
    it('should update phase and state based on the new phase', () => {
      // Mock getCopies for initial phase 'swap'
      mockGetCopies.mockReturnValueOnce({
        contentHeadline: 'Initial Headline',
        contentSubtitle: 'Initial Subtitle',
        currentStep: 1,
        totalSteps: 5,
        primaryButtonText: 'Next',
        secondaryButtonText: 'Back',
        showSecondaryButton: false,
        showStepper: true,
      });
      const { result } = renderHook(() => useAppState());

      // Mock getCopies for the new phase 'approve'
      const expectedStateForApprove = {
        contentHeadline: 'Approve Tokens',
        contentSubtitle: 'Please approve the selected tokens.',
        currentStep: 2,
        totalSteps: 5,
        primaryButtonText: 'Approve',
        secondaryButtonText: 'Go Back',
        showSecondaryButton: true,
        showStepper: true,
      };
      mockGetCopies.mockReturnValueOnce(expectedStateForApprove);

      act(() => {
        result.current.updateState('approve');
      });

      expect(result.current.phase).toBe('approve');
      expect(result.current.state).toEqual(expectedStateForApprove);
      expect(mockGetCopies).toHaveBeenCalledWith('approve');
    });
  });

  describe('setApprovedTokens', () => {
    it('should update approvedTokens with the provided array', () => {
      const { result } = renderHook(() => useAppState());
      // Corrected type for newTokens
      const newTokens: Array<SelectedToken> = [
        { address: '0xtoken1', name: 'Token 1', symbol: 'T1', isSelected: true, type: 'ERC-20', networkId: 1, networkName:'Eth', decimals:18, amount:1, rawBalance:1n, price:1, logoURI:'uri' },
        { address: '0xtoken2', name: 'Token 2', symbol: 'T2', isSelected: true, type: 'ERC-20', networkId: 1, networkName:'Eth', decimals:18, amount:1, rawBalance:1n, price:1, logoURI:'uri' },
      ];

      act(() => {
        result.current.setApprovedTokens(newTokens);
      });

      expect(result.current.approvedTokens).toEqual(newTokens);
    });

    it('should update approvedTokens with an empty array', () => {
      const { result } = renderHook(() => useAppState());
      const initialTokens: Array<SelectedToken> = [
        { address: '0xtokenA', name: 'Token A', symbol: 'TA', isSelected: true, type: 'ERC-20', networkId: 1, networkName:'Eth', decimals:18, amount:1, rawBalance:1n, price:1, logoURI:'uri' },
      ];
      // First set some tokens
      act(() => {
        result.current.setApprovedTokens(initialTokens);
      });
      // Then set to empty
      act(() => {
        result.current.setApprovedTokens([]);
      });

      expect(result.current.approvedTokens).toEqual([]);
    });
  });

  describe('setIsReadyToSell', () => {
    it('should update isReadyToSell to true', () => {
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.setIsReadyToSell(true);
      });
      expect(result.current.isReadyToSell).toBe(true);
    });

    it('should update isReadyToSell to false', () => {
      const { result } = renderHook(() => useAppState());
      // First set to true
      act(() => {
        result.current.setIsReadyToSell(true);
      });
      // Then set to false
      act(() => {
        result.current.setIsReadyToSell(false);
      });
      expect(result.current.isReadyToSell).toBe(false);
    });
  });

  describe('setSelectedTokens', () => {
    it('should update selectedTokens with the provided array', () => {
      const { result } = renderHook(() => useAppState());
      // Corrected type for newTokens
      const newTokens: Array<SelectedToken> = [
        { address: '0xtokenX', name: 'Token X', symbol: 'TX', isSelected: true, type: 'ERC-20', networkId: 1, networkName:'Eth', decimals:18, amount:1, rawBalance:1n, price:1, logoURI:'uri' },
        { address: '0xtokenY', name: 'Token Y', symbol: 'TY', isSelected: true, type: 'ERC-20', networkId: 1, networkName:'Eth', decimals:18, amount:1, rawBalance:1n, price:1, logoURI:'uri' },
      ];
      act(() => {
        result.current.setSelectedTokens(newTokens);
      });
      expect(result.current.selectedTokens).toEqual(newTokens);
    });

    it('should update selectedTokens with an empty array', () => {
      const { result } = renderHook(() => useAppState());
      const initialTokens: Array<SelectedToken> = [
        { address: '0xtokenA', name: 'Token A', symbol: 'TA', isSelected: true, type: 'ERC-20', networkId: 1, networkName:'Eth', decimals:18, amount:1, rawBalance:1n, price:1, logoURI:'uri' },
      ];
      // First set some tokens
      act(() => {
        result.current.setSelectedTokens(initialTokens);
      });
      // Then set to empty
      act(() => {
        result.current.setSelectedTokens([]);
      });
      expect(result.current.selectedTokens).toEqual([]);
    });
  });

  describe('setReceivedToken', () => {
    it('should update receivedToken with the provided string', () => {
      const { result } = renderHook(() => useAppState());
      const newToken = '0x12345';
      act(() => {
        result.current.setReceivedToken(newToken);
      });
      expect(result.current.receivedToken).toBe(newToken);
    });

    it('should update receivedToken with an empty string', () => {
      const { result } = renderHook(() => useAppState());
      // First set some token
      act(() => {
        result.current.setReceivedToken('0xABC');
      });
      // Then set to empty
      act(() => {
        result.current.setReceivedToken('');
      });
      expect(result.current.receivedToken).toBe('');
    });
  });

  describe('setSelectedNetwork', () => {
    it('should update selectedNetwork with the provided network object', () => {
      const { result } = renderHook(() => useAppState());
      // Corrected type for newNetwork
      const newNetwork: SupportedChain = { 
        id: 1, chainId: 1, name: 'Ethereum', explorerUrl: 'https://etherscan.io', 
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18},
        rpcUrls: {default: {http: ['']}, public: {http: ['']}}
      };
      act(() => {
        result.current.setSelectedNetwork(newNetwork);
      });
      expect(result.current.selectedNetwork).toEqual(newNetwork);
    });

    it('should update selectedNetwork with undefined', () => {
      const { result } = renderHook(() => useAppState());
      const initialNetwork: SupportedChain = { 
        id: 1, chainId: 1, name: 'Ethereum', explorerUrl: 'https://etherscan.io',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18},
        rpcUrls: {default: {http: ['']}, public: {http: ['']}}
      };
      // First set some network
      act(() => {
        result.current.setSelectedNetwork(initialNetwork);
      });
      // Then set to undefined
      act(() => {
        result.current.setSelectedNetwork(undefined);
      });
      expect(result.current.selectedNetwork).toBeUndefined();
    });
  });

  describe('setOperationType', () => {
    it('should update operationType with the provided type "sell"', () => {
      const { result } = renderHook(() => useAppState());
      act(() => {
        result.current.setOperationType('sell' as OperationType);
      });
      expect(result.current.operationType).toBe('sell');
    });

    it('should update operationType with the provided type "swap"', () => {
      const { result } = renderHook(() => useAppState());
      // First set to "sell"
      act(() => {
        result.current.setOperationType('sell' as OperationType);
      });
      // Then set to "swap"
      act(() => {
        result.current.setOperationType('swap' as OperationType);
      });
      expect(result.current.operationType).toBe('swap');
    });
  });
});
