/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { AnyDataModel } from "convex/server";
import type { GenericId } from "convex/values";

/**
 * No tables defined yet. Schema is written in P1.
 */
export type DataModel = AnyDataModel;

/**
 * An identifier for a document in Convex.
 */
export type Id<TableName extends string = string> = GenericId<TableName>;
