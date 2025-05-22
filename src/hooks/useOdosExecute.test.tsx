import { act, renderHook, waitFor } from '@testing-library/react';
import { useOdosExecute } from './useOdosExecute';
import { useApiQuery } from '@/hooks/api/useApiQuery';
import { useAccount } from 'wagmi';
import { buildExecuteRequest } from '@/lib/odos/buildBody';
import { OdosQuoteResponse, OdosExecutionResponse, OdosExecutionRequest, ExecuteStatus } from '@/types/odos';

// Mock dependencies
jest.mock('@/hooks/api/useApiQuery');
jest.mock('wagmi');
jest.mock('@/lib/odos/buildBody');

// Define mock types for convenience
const mockUseApiQuery = useApiQuery as jest.Mock;
const mockUseAccount = useAccount as jest.Mock;
const mockBuildExecuteRequest = buildExecuteRequest as jest.Mock;

const mockUserAddress = '0xTestUserAddressForExecute';
const mockPathId = 'test-path-id-for-execute';

const sampleQuoteData: OdosQuoteResponse = {
  pathId: mockPathId,
  // Add other necessary fields from OdosQuoteResponse if your hook uses them
  // For now, pathId is the primary one used by buildExecuteRequest
};

const mockExecuteRequest: OdosExecutionRequest = {
  userAddr: mockUserAddress,
  pathId: mockPathId,
  simulate: true, // Initially for simulation
};

describe('useOdosExecute', () => {
  const mockApiRefetch = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockUseApiQuery.mockReset();
    mockUseAccount.mockReset();
    mockBuildExecuteRequest.mockReset();
    mockApiRefetch.mockClear();

    // Default mock implementations
    mockUseAccount.mockReturnValue({ address: mockUserAddress });
    mockBuildExecuteRequest.mockReturnValue(mockExecuteRequest);
    // Default mock for useApiQuery (not enabled initially)
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
    expect(result.current.executionStatus).toBe(ExecuteStatus.NO_EXECUTE);
    expect(result.current.simulationError).toBeNull();
  });

  describe('Setting quote data and triggering execution', () => {
    it('should build request, call refetch, and set loading state when quote data is set', async () => {
      mockApiRefetch.mockResolvedValue({ data: { /* mock successful simulation data */ } }); // Mock refetch success
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData);
      });

      expect(result.current.executionStatus).toBe(ExecuteStatus.LOADING_EXECUTE);
      expect(result.current.isExecutionLoading).toBe(true); // Directly set in hook, or from useApiQuery if enabled
      expect(mockBuildExecuteRequest).toHaveBeenCalledWith(mockPathId, mockUserAddress, true); // simulate: true
      expect(mockApiRefetch).toHaveBeenCalledTimes(1);

      // Wait for loading to complete
      await waitFor(() => expect(result.current.isExecutionLoading).toBe(false));
    });

    it('should handle successful execution simulation', async () => {
      const mockSuccessfulSimulation: OdosExecutionResponse = {
        transaction: {
          // ... transaction fields
        },
        simulation: {
          isSuccess: true,
          gasEstimate: '100000',
          // ... other simulation fields
        },
      };
      mockApiRefetch.mockResolvedValue({ data: mockSuccessfulSimulation });
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData);
      });

      await waitFor(() => expect(result.current.executionStatus).toBe(ExecuteStatus.SUCCESS_EXECUTE));

      expect(result.current.odosExecutionData).toEqual(mockSuccessfulSimulation);
      expect(result.current.isExecutionLoading).toBe(false);
      expect(result.current.executionError).toBeNull();
      expect(result.current.simulationError).toBeNull();
      // Check if executionRequest (internal state) is reset, if possible, or that no further calls happen without new quoteData
      // For now, we assume it's reset if status is SUCCESS_EXECUTE and no new calls are made.
      // One way to test reset is if calling setQuoteData(null) or similar resets things,
      // or if subsequent calls to setQuoteData with the same data don't trigger new API calls
      // unless some internal "executionRequest" state is cleared.
      // The provided hook structure implies executionRequest is cleared as it's generated inside useEffect.
    });

    it('should handle failed execution simulation (simulation error)', async () => {
      const simulationErrorMessage = 'Execution likely to fail';
      const mockFailedSimulation: OdosExecutionResponse = {
        transaction: {
          // ... transaction fields
        },
        simulation: {
          isSuccess: false,
          gasEstimate: '0',
          error: simulationErrorMessage,
          // ... other simulation fields
        },
      };
      mockApiRefetch.mockResolvedValue({ data: mockFailedSimulation });
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData);
      });

      await waitFor(() => expect(result.current.executionStatus).toBe(ExecuteStatus.ERROR_EXECUTE));

      expect(result.current.odosExecutionData).toBeNull(); // Or it might contain the simulation error data
      expect(result.current.isExecutionLoading).toBe(false);
      expect(result.current.executionError).toBeNull(); // API call was successful, but simulation failed
      expect(result.current.simulationError).toBe(simulationErrorMessage);
    });

    it('should handle API error during execution simulation', async () => {
      const apiErrorMessage = 'Odos API unavailable';
      const mockApiError = { response: { data: { message: apiErrorMessage } } }; // Example error structure
      mockApiRefetch.mockRejectedValue(mockApiError);
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData);
      });

      await waitFor(() => expect(result.current.executionStatus).toBe(ExecuteStatus.ERROR_EXECUTE));

      expect(result.current.odosExecutionData).toBeNull();
      expect(result.current.isExecutionLoading).toBe(false);
      expect(result.current.executionError).toBe(apiErrorMessage);
      expect(result.current.simulationError).toBeNull();
    });

     it('should handle generic API error if detail message is not available', async () => {
      const genericApiError = { message: "Network Error" };
      mockApiRefetch.mockRejectedValue(genericApiError);
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData);
      });

      await waitFor(() => expect(result.current.executionStatus).toBe(ExecuteStatus.ERROR_EXECUTE));
      expect(result.current.executionError).toBe("Network Error");
    });


    it('should reset states when setQuoteData is called with null', async () => {
      // First, successfully get data
      const mockSuccessfulSimulation: OdosExecutionResponse = {
        transaction: {}, simulation: { isSuccess: true, gasEstimate: '100' }
      };
      mockApiRefetch.mockResolvedValue({ data: mockSuccessfulSimulation });
      const { result } = renderHook(() => useOdosExecute());

      act(() => {
        result.current.setQuoteData(sampleQuoteData);
      });
      await waitFor(() => expect(result.current.executionStatus).toBe(ExecuteStatus.SUCCESS_EXECUTE));
      expect(result.current.odosExecutionData).not.toBeNull();

      // Now, call with null
      act(() => {
        result.current.setQuoteData(null);
      });

      expect(result.current.odosExecutionData).toBeNull();
      expect(result.current.isExecutionLoading).toBe(false);
      expect(result.current.executionError).toBeNull();
      expect(result.current.executionStatus).toBe(ExecuteStatus.NO_EXECUTE);
      expect(result.current.simulationError).toBeNull();
      // Ensure no API call is made when quoteData is null
      expect(mockApiRefetch).toHaveBeenCalledTimes(1); // Only the first call
    });
  });
});
