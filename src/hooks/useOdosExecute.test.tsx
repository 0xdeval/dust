import { describe, it, expect, beforeEach, vi } from 'vitest'; // Vitest globals
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOdosExecute } from './useOdosExecute';
import { useApiQuery } from '@/hooks/api/useApiQuery';
import { useAccount, type UseAccountReturnType } from 'wagmi'; // UseAccountReturnType for typing mock
import { buildExecuteRequest } from '@/lib/odos/buildBody';
// Changed to import type and corrected path
import type { 
  OdosQuoteResponse, 
  OdosExecutionResponse, 
  OdosExecutionRequest, 
  ExecuteStatus // ExecuteStatus is a type too
} from '@/types/api/odos'; 

// Mock dependencies
vi.mock('@/hooks/api/useApiQuery'); // Changed to vi.mock
vi.mock('wagmi', async (importOriginal) => { // Ensure wagmi is mocked correctly for useAccount
  const actual = await importOriginal<typeof import('wagmi')>();
  return {
    ...actual,
    useAccount: vi.fn(),
  };
});
vi.mock('@/lib/odos/buildBody'); // Changed to vi.mock

// Define mock types for convenience
const mockUseApiQuery = useApiQuery as vi.Mock; // Changed to vi.Mock
const mockUseAccount = useAccount as vi.Mock<[], Partial<UseAccountReturnType>>; // Typed mock
const mockBuildExecuteRequest = buildExecuteRequest as vi.Mock; // Changed to vi.Mock

const mockUserAddress = '0xTestUserAddressForExecute' as `0x${string}`; // Type assertion
const mockPathId = 'test-path-id-for-execute';

// Provide a more complete mock for OdosQuoteResponse if specific fields are accessed
const sampleQuoteData: Partial<OdosQuoteResponse> = { // Make it Partial for less boilerplate
  pathId: mockPathId,
  // Other fields like blockNumber, chainId, etc., can be added if the hook reads them
};

const mockExecuteRequest: OdosExecutionRequest = {
  userAddr: mockUserAddress, // Already typed as `0x${string}`
  pathId: mockPathId,
  simulate: true, 
};

// Define a type for the mock API error structure if it's consistent
interface MockApiError {
  response?: {
    data?: {
      message?: string;
      detail?: string; // As used in the original tests
    };
  };
  message?: string; // For generic errors
}


describe('useOdosExecute', () => {
  const mockApiRefetch = vi.fn(); // Already vi.fn

  beforeEach(() => {
    mockUseApiQuery.mockReset();
    mockUseAccount.mockReset();
    mockBuildExecuteRequest.mockReset();
    mockApiRefetch.mockClear();

    // Default mock implementations
    mockUseAccount.mockReturnValue({ address: mockUserAddress } as Partial<UseAccountReturnType>);
    mockBuildExecuteRequest.mockReturnValue(mockExecuteRequest);
    mockUseApiQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      refetch: mockApiRefetch,
      isError: false,
      isSuccess: false,
    });
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useOdosExecute());
    expect(result.current.odosExecutionData).toBeNull();
    expect(result.current.isExecutionLoading).toBe(false);
    expect(result.current.executionError).toBeNull();
    expect(result.current.executionStatus).toBe('IDLE' as ExecuteStatus); // Use string literal if type not imported
    expect(result.current.simulationError).toBeNull();
  });

  describe('Setting quote data and triggering execution', () => {
    it('should build request, call refetch, and set loading state on setQuoteData', async () => {
      mockApiRefetch.mockResolvedValue({ data: { /* mock successful simulation data */ } });
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData as OdosQuoteResponse);
      });

      expect(result.current.executionStatus).toBe('LOADING_EXECUTE' as ExecuteStatus);
      expect(result.current.isExecutionLoading).toBe(true); 
      expect(mockBuildExecuteRequest).toHaveBeenCalledWith(mockPathId, mockUserAddress, true);
      expect(mockApiRefetch).toHaveBeenCalledTimes(1);

      await waitFor(() => expect(result.current.isExecutionLoading).toBe(false));
    });

    it('should handle successful execution simulation', async () => {
      const mockSuccessfulSimulation: OdosExecutionResponse = {
        transaction: { to: '0x123', data: '0xabc', value: '0', gas: '100000', chainId: 1 }, // Added required fields
        simulation: { isSuccess: true, gasEstimate: '100000' },
      };
      mockApiRefetch.mockResolvedValue({ data: mockSuccessfulSimulation });
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData as OdosQuoteResponse);
      });

      await waitFor(() => 
        expect(result.current.executionStatus).toBe('SUCCESS_EXECUTE' as ExecuteStatus)
      );

      expect(result.current.odosExecutionData).toEqual(mockSuccessfulSimulation);
      expect(result.current.isExecutionLoading).toBe(false);
      expect(result.current.executionError).toBeNull();
      expect(result.current.simulationError).toBeNull();
    });

    it('should handle failed execution simulation', async () => {
      const simulationErrorMessage = 'Execution likely to fail';
      const mockFailedSimulation: OdosExecutionResponse = {
        transaction: { to: '0x123', data: '0xabc', value: '0', gas: '0', chainId: 1 }, // Added required fields
        simulation: { isSuccess: false, gasEstimate: '0', error: simulationErrorMessage },
      };
      mockApiRefetch.mockResolvedValue({ data: mockFailedSimulation });
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData as OdosQuoteResponse);
      });

      await waitFor(() => 
        expect(result.current.executionStatus).toBe('ERROR' as ExecuteStatus)
      );

      expect(result.current.odosExecutionData).toBeNull();
      expect(result.current.isExecutionLoading).toBe(false);
      expect(result.current.executionError).toBeNull();
      expect(result.current.simulationError).toBe(simulationErrorMessage);
    });

    it('should handle API error during execution simulation', async () => {
      const apiErrorMessage = 'Odos API unavailable';
      const mockApiErr: MockApiError = { response: { data: { message: apiErrorMessage } } };
      mockApiRefetch.mockRejectedValue(mockApiErr);
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData as OdosQuoteResponse);
      });

      await waitFor(() => 
        expect(result.current.executionStatus).toBe('ERROR' as ExecuteStatus)
      );

      expect(result.current.odosExecutionData).toBeNull();
      expect(result.current.isExecutionLoading).toBe(false);
      expect(result.current.executionError).toBe(apiErrorMessage);
      expect(result.current.simulationError).toBeNull();
    });

     it('should handle generic API error if detail/message not available', async () => {
      const genericApiErr: MockApiError = { message: "Network Error" };
      mockApiRefetch.mockRejectedValue(genericApiErr);
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData as OdosQuoteResponse);
      });

      await waitFor(() => 
        expect(result.current.executionStatus).toBe('ERROR' as ExecuteStatus)
      );
      expect(result.current.executionError).toBe("Network Error");
    });


    it('should reset states when setQuoteData is called with null', async () => {
      const mockSim: OdosExecutionResponse = {
        transaction: { to: '0x123', data: '0xabc', value: '0', gas: '100', chainId: 1 }, 
        simulation: { isSuccess: true, gasEstimate: '100' }
      };
      mockApiRefetch.mockResolvedValue({ data: mockSim });
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData as OdosQuoteResponse);
      });
      await waitFor(() => 
        expect(result.current.executionStatus).toBe('SUCCESS_EXECUTE' as ExecuteStatus)
      );
      expect(result.current.odosExecutionData).not.toBeNull();

      act(() => {
        result.current.setQuoteData(null);
      });

      expect(result.current.odosExecutionData).toBeNull();
      expect(result.current.isExecutionLoading).toBe(false);
      expect(result.current.executionError).toBeNull();
      expect(result.current.executionStatus).toBe('IDLE' as ExecuteStatus);
      expect(result.current.simulationError).toBeNull();
      expect(mockApiRefetch).toHaveBeenCalledTimes(1); 
    });
  });
});
