import { pickBy } from "es-toolkit";
import { useCallback } from "react";
import buildUrl from "@/hooks/api/buildUrl";
import type { ResourceName, ResourceMethod, ResourcePathParams } from "@/types/api/resources";

export interface ApiFetchParams<R extends ResourceName> {
  pathParams?: ResourcePathParams<R>;
  queryParams?: Record<string, string | Array<string> | number | boolean | undefined | null>;
  fetchParams?: {
    body?: BodyInit | null;
    method?: string;
    signal?: AbortSignal;
    headers?: HeadersInit;
  };
  logError?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  rawResponse: Response;
}

export default function useApiFetch() {
  return useCallback(
    async <R extends ResourceName, M extends ResourceMethod<R>, T = unknown>(
      resourceName: R,
      resourceEndpoint: M,
      { pathParams, queryParams, fetchParams, logError = true }: ApiFetchParams<R> = {}
    ): Promise<ApiResponse<T>> => {
      const url = buildUrl(resourceName, resourceEndpoint, pathParams, queryParams);

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
        logError && console.log(`ERROR:`, error);
        throw {
          status: response.status,
          message: error.message || response.statusText,
          data: error,
        };
      }

      const data = await response.json();
      return { data, rawResponse: response };
    },
    []
  );
}
