import { erc20Abi } from "@/lib/abis/erc-20";
import { useEffect, useState } from "react";
import {
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

type UseTokenApprovalProps = {
  owner: `0x${string}`; // The address you want to approve tokens for
  spender: `0x${string}`; // The address you want to approve tokens for
};

export const useTokenApproval = ({ owner, spender }: UseTokenApprovalProps) => {
  const MAX_UINT256 = BigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  const [tokenToApprove, setTokenToApprove] = useState<`0x${string}` | null>(
    null
  );
  const [tokenToApproveBalance, setTokenToApproveBalance] = useState<bigint>(
    BigInt(0)
  );

  const [isTokenApproved, setIsTokenApproved] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [approvedTokenUpdated, setApprovedTokenUpdated] = useState(false);

  console.log("[useTokenApproval] Current State:", {
    tokenToApprove,
    isTokenApproved,
    isApproving,
    approvedTokenUpdated,
  });

  const setApprovedTokenUpdatedWrapper = () => {
    console.log("[useTokenApproval] Updating approvedTokenUpdated");
    setApprovedTokenUpdated((prev) => !prev);
  };

  const resetOnConfirmation = () => {
    console.log("[useTokenApproval] Transaction confirmed, updating states");
    setIsApproving(false);
    setIsTokenApproved(true);
    setApprovedTokenUpdatedWrapper();
    setTokenToApprove(null); // Reset so we can approve another

    console.log(
      "[useTokenApproval] isTokenApproved after reset:",
      isTokenApproved
    );
  };

  const {
    data: allowance,
    isSuccess: isAllowanceSuccess,
    isError: isAllowanceError,
    isPending: isAllowancePending,
    error: allowanceError,
  } = useReadContract({
    address: tokenToApprove ?? undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender],
    query: {
      enabled: !!tokenToApprove,
    },
  });

  console.log("[useTokenApproval] Allowance status:", {
    allowance,
    isAllowanceSuccess,
    isAllowanceError,
    isAllowancePending,
    allowanceError,
  });

  const {
    writeContract: approveToken,
    data: approveHash,
    isPending: isContractTokenApproving,
    isSuccess: isContractTokenApproved,
    isError: isContractTokenApprovalError,
    error: contractTokenApprovalError,
    reset: resetApprovalRequest,
  } = useWriteContract();

  console.log("[useTokenApproval] Approval status:", {
    approveHash,
    isContractTokenApproving,
    isContractTokenApproved,
    isContractTokenApprovalError,
    contractTokenApprovalError,
  });

  useEffect(() => {
    if (tokenToApprove) {
      console.log("[useTokenApproval] Initiating token approval");
      setIsApproving(true);
      approveToken({
        address: tokenToApprove,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, MAX_UINT256],
      });
    }
  }, [tokenToApprove]);

  useEffect(() => {
    if (isAllowanceSuccess && allowance >= tokenToApproveBalance) {
      console.log(
        "[useTokenApproval] Allowance is greater than token balance. Won't ask to approve again"
      );
      resetOnConfirmation();
    } else if (isAllowanceSuccess && !isAllowanceError && tokenToApprove) {
      console.log("[useTokenApproval] Initiating token approval");
      setIsApproving(true);
      approveToken({
        address: tokenToApprove,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, MAX_UINT256],
      });
    }
  }, [tokenToApprove, isAllowanceSuccess, allowance]); //isSimulationSuccess, simulationResult

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: {
      enabled: !!approveHash,
    },
  });

  console.log("[useTokenApproval] Transaction Status:", {
    approveHash,
    isConfirmed,
    enabled: !!approveHash,
  });

  // When transaction confirmed
  useEffect(() => {
    console.log("[useTokenApproval] Checking confirmation:", {
      isConfirmed,
      currentApprovalState: isTokenApproved,
    });

    if (isConfirmed) {
      resetOnConfirmation();
    }
  }, [isConfirmed]);

  return {
    setTokenToApprove,
    allowanceError,
    resetApprovalRequest,
    contractTokenApprovalError,
    isTokenApproved,
    isApproving: isApproving || isContractTokenApproving || isAllowancePending, // isSimulating ||
    setApprovedTokenUpdated: setApprovedTokenUpdatedWrapper,
  };
};
