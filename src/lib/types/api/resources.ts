import type { RESOURCES } from "@/hooks/api/resources";

export interface EndpointConfig {
  path: string;
}

export interface Resource {
  base: string;
  [key: string]: string | EndpointConfig;
}

export type ResourceName = keyof typeof RESOURCES;
export type ResourceMethod<R extends ResourceName> = Exclude<keyof Resource, "base">;

export type ResourcePayload<R extends ResourceName, M extends ResourceMethod<R>> = unknown;
export type ResourceError<E = unknown> = {
  status: number;
  message: string;
  data?: E;
};

// Path parameters type
export type ResourcePathParams<R extends ResourceName> = Record<string, string>;
