import type { RESOURCES } from "@/hooks/api/resources";

export interface EndpointConfig {
  path: string;
}

export interface Resource {
  base: string;
  [key: string]: string | EndpointConfig;
}

export type ResourceName = keyof typeof RESOURCES;
export type ResourceMethod<_R extends ResourceName> = Exclude<keyof Resource, "base">;

export type ResourcePayload<_R extends ResourceName, _M extends ResourceMethod<_R>> = unknown;
export type ResourceError<E = unknown> = {
  status: number;
  message: string;
  /** Optional error data that can be used to provide additional context about the error */
  data?: E;
};

export type ResourcePathParams<_R extends ResourceName> = Record<string, string>;
