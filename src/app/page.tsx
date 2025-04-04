"use client";

import { useAccount } from "wagmi";
import { Skeleton } from "@chakra-ui/react";

import { InfoContainer } from "@/components/layouts/Content/InfoContainer";
import { ContentHeadline } from "@/components/layouts/Content/ContentHeadline";
import { useAppStateContext } from "@/context/AppStateContext";

export default function Home() {
  const { phase, state, updateState } = useAppStateContext();

  return (
    <Skeleton loading={!state}>
      <InfoContainer>
        {state && (
          <ContentHeadline
            title={state?.contentHeadline}
            subtitle={state?.contentSubtitle}
            buttonLabel={state?.contentButtonLabel}
            buttonAction={state?.contentButtonAction}
          />
        )}
      </InfoContainer>
    </Skeleton>
  );
}
