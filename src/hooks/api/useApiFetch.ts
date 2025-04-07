import { useQueryClient } from "@tanstack/react-query";
import { pickBy } from "es-toolkit";
import { useCallback } from "react";
import buildUrl from "@/hooks/api/buildUrl";
import type {
  ResourceName,
  ResourceMethod,
  ResourcePathParams,
} from "@/lib/types/api/resources";

export interface ApiFetchParams<R extends ResourceName> {
  pathParams?: ResourcePathParams<R>;
  queryParams?: Record<
    string,
    string | Array<string> | number | boolean | undefined | null
  >;
  fetchParams?: {
    body?: BodyInit | null;
    method?: string;
    signal?: AbortSignal;
    headers?: HeadersInit;
  };
  logError?: boolean;
}

export default function useApiFetch() {
  const queryClient = useQueryClient();

  return useCallback(
    async <R extends ResourceName, M extends ResourceMethod<R>, T = unknown>(
      resourceName: R,
      resourceEndpoint: M,
      { pathParams, queryParams, fetchParams, logError }: ApiFetchParams<R> = {}
    ): Promise<T> => {
      const url = buildUrl(
        resourceName,
        resourceEndpoint,
        pathParams,
        queryParams
      );

      const headers = pickBy(
        {
          ...fetchParams?.headers,
          "Content-Type": "application/json",
        },
        Boolean
      ) as HeadersInit;

      const response = await fetch(url, {
        headers,
        ...fetchParams,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "API request failed");
      }

      return response.json();
    },
    [queryClient]
  );
}
