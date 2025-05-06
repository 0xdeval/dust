import type { OdosExecuteResponse } from "@/types/api/odos";
import { useState, useEffect, useMemo } from "react";
import type { OdosExecuteRequest, OdosQuoteResponse, OdosStatus } from "@/types/api/odos";
import { buildExecuteRequest } from "@/lib/odos/buildBody";
import { useAccount } from "wagmi";
import useApiQuery from "@/hooks/api/useApiQuery";

export const useOdosExecute = () => {
  const { address } = useAccount();
  const [quoteData, setQuoteData] = useState<OdosQuoteResponse | null>(null);
  const [executionRequest, setExecutionRequest] = useState<OdosExecuteRequest | null>(null);
  const [executionStatus, setExecutionStatus] = useState<OdosStatus>("IDLE");
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const [odosExecutionData, setOdosExecutionData] = useState<OdosExecuteResponse | null>(null);

  useEffect(() => {
    if (quoteData) {
      const req = buildExecuteRequest({
        pathId: quoteData.pathId,
        userAddress: address as `0x${string}`,
        simulate: true,
      });
      setExecutionRequest(req);
      setExecutionStatus("LOADING_EXECUTE");
      setSimulationError(null);
    }
  }, [quoteData, address]);

  const executionRequestKey = useMemo(
    () => (executionRequest ? JSON.stringify(executionRequest) : ""),
    [executionRequest]
  );

  const {
    data: executionData,
    isLoading: isExecutionLoading,
    error: executionError,
  } = useApiQuery<"odos", "execute", OdosExecuteResponse>("odos", "execute", {
    fetchParams: {
      method: "POST",
      body: JSON.stringify(executionRequest),
    },
    queryOptions: {
      enabled: Boolean(executionRequest),
      queryKey: ["odos", "execute", executionRequestKey],
      retry: 3,
      refetchOnWindowFocus: false,
    },
    logError: true,
  });

  useEffect(() => {
    if (isExecutionLoading) return;

    if (executionData?.data && !isExecutionLoading && !executionError) {
      const executionFormattedData = executionData.data as OdosExecuteResponse;
      if (executionFormattedData.simulation?.isSuccess) {
        setExecutionStatus("SUCCESS_EXECUTE");
        setOdosExecutionData(executionFormattedData);
        setSimulationError(null);
      } else {
        setSimulationError(
          executionFormattedData.simulation?.simulationError?.errorMessage ||
            "An error occurred during the transaction simulation"
        );
        setExecutionStatus("ERROR");
        setOdosExecutionData(null);
      }
      setExecutionRequest(null);
    } else if (executionError) {
      setExecutionStatus("ERROR");
      setSimulationError(null);
      setExecutionRequest(null);
      setOdosExecutionData(null);
    }
  }, [executionData, isExecutionLoading, executionError]);

  return {
    executionData: odosExecutionData,
    isExecutionLoading,
    executionError: executionError?.data as { detail?: string } | null,
    executionStatus,
    simulationError,
    setQuoteData,
  };
};
