import { compile } from "path-to-regexp";

import { RESOURCES } from "@/hooks/api/resources";
import type {
  EndpointConfig,
  Resource,
  ResourceName,
  ResourcePathParams,
} from "@/types/api/resources";
import type { ResourceMethod } from "@/types/api/resources";

export default function buildUrl<R extends ResourceName>(
  resourceName: R,
  resourceEndpoint: ResourceMethod<R>,
  pathParams?: ResourcePathParams<R>,
  queryParams?: Record<string, string | Array<string> | number | boolean | null | undefined>
): string {
  const resource: Resource = RESOURCES[resourceName];
  const endpoint = resource[resourceEndpoint] as EndpointConfig;
  const baseUrl = resource.base;

  const url = new URL(compile(endpoint.path)(pathParams), baseUrl);

  queryParams &&
    Object.entries(queryParams).forEach(([key, value]) => {
      value !== undefined && value !== "" && url.searchParams.append(key, String(value));
    });

  return url.toString();
}
