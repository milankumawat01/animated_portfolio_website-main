/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
export type RemoteQueryFunction = FunctionReference<"query", "public">;
export type RemoteMutationFunction = FunctionReference<"mutation", "public">;
export type RemoteActionFunction = FunctionReference<"action", "public">;

type Modules = Record<string, never>;

export type API = ApiFromModules<Modules>;
export declare const api: FilterApi<API, FunctionReference<any, "public">>;
export declare const internal: FilterApi<
  API,
  FunctionReference<any, "internal">
>;
