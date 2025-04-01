import { RESOURCES } from "@/hooks/api/resources";

// export type ResourceName = keyof typeof RESOURCES;

// export interface EndpointConfig {
//   path: string;
// }

// export interface Resource {
//   base: string;
//   quote: EndpointConfig;
//   execute: EndpointConfig;
// }

// export interface ApiResource {
//   path: ResourcePath;
//   endpoint?: string;
//   basePath?: string;
//   pathParams?: Array<string>;
//   needAuth?: boolean; // for external APIs which require authentication
//   headers?: RequestInit["headers"];
// }

// Base types for API resources
export interface EndpointConfig {
  path: string;
}

export interface Resource {
  base: string;
  [key: string]: string | EndpointConfig;
}

// Resource method types
export type ResourceName = keyof typeof RESOURCES;
export type ResourceMethod<R extends ResourceName> = Exclude<
  keyof Resource,
  "base"
>;

// Response and Error types
export type ResourcePayload<
  R extends ResourceName,
  M extends ResourceMethod<R>
> = unknown;
export type ResourceError<E = unknown> = {
  status: number;
  message: string;
  data?: E;
};

// Path parameters type
export type ResourcePathParams<R extends ResourceName> = Record<string, string>;
