import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type {
  ResourceError,
  ResourceMethod,
  ResourceName,
  ResourcePathParams,
  ResourcePayload,
} from "@/types/api/resources";
import type { ApiFetchParams, ApiResponse } from "@/hooks/api/useApiFetch";
import useApiFetch from "@/hooks/api/useApiFetch";

export interface ApiQueryParams<R extends ResourceName, M extends ResourceMethod<R>, E = unknown> {
  pathParams?: ResourcePathParams<R>;
  queryParams?: Record<string, string | Array<string> | number | boolean | undefined>;
  fetchParams?: Omit<ApiFetchParams<R>["fetchParams"], "signal">;
  queryOptions?: Partial<
    UseQueryOptions<
      ApiResponse<ResourcePayload<R, M>>,
      ResourceError<E>,
      ApiResponse<ResourcePayload<R, M>>,
      ReadonlyArray<unknown>
    >
  >;
  logError?: boolean;
}

export function getResourceKey<R extends ResourceName, M extends ResourceMethod<R>>(
  resource: R,
  method: M,
  { pathParams, queryParams }: Partial<ApiQueryParams<R, M>> = {}
) {
  if (pathParams || queryParams) {
    return [resource, method, { ...pathParams, ...queryParams }];
  }
  return [resource, method];
}

export default function useApiQuery<
  R extends ResourceName,
  M extends ResourceMethod<R>,
  E = unknown,
>(
  resource: R,
  method: M,
  { queryOptions, pathParams, queryParams, fetchParams, logError }: ApiQueryParams<R, M, E> = {}
) {
  const apiFetch = useApiFetch();

  return useQuery<
    ApiResponse<ResourcePayload<R, M>>,
    ResourceError<E>,
    ApiResponse<ResourcePayload<R, M>>,
    ReadonlyArray<unknown>
  >({
    queryKey:
      queryOptions?.queryKey || getResourceKey(resource, method, { pathParams, queryParams }),
    queryFn: async ({ signal }) => {
      return apiFetch(resource, method, {
        pathParams,
        queryParams,
        logError,
        fetchParams: { ...fetchParams, signal },
      });
    },
    ...queryOptions,
  });
}
