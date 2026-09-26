/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as experience from "../experience.js";
import type * as http from "../http.js";
import type * as internal_importProjects from "../internal/importProjects.js";
import type * as internal_notify from "../internal/notify.js";
import type * as internal_projectCatalog from "../internal/projectCatalog.js";
import type * as internal_projectCorrections from "../internal/projectCorrections.js";
import type * as internal_revalidate from "../internal/revalidate.js";
import type * as internal_seed from "../internal/seed.js";
import type * as leads from "../leads.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_images from "../lib/images.js";
import type * as lib_r2 from "../lib/r2.js";
import type * as lib_revalidate from "../lib/revalidate.js";
import type * as lib_validation from "../lib/validation.js";
import type * as media from "../media.js";
import type * as projects from "../projects.js";
import type * as siteSettings from "../siteSettings.js";
import type * as skills from "../skills.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  blog: typeof blog;
  experience: typeof experience;
  http: typeof http;
  "internal/importProjects": typeof internal_importProjects;
  "internal/notify": typeof internal_notify;
  "internal/projectCatalog": typeof internal_projectCatalog;
  "internal/projectCorrections": typeof internal_projectCorrections;
  "internal/revalidate": typeof internal_revalidate;
  "internal/seed": typeof internal_seed;
  leads: typeof leads;
  "lib/auth": typeof lib_auth;
  "lib/images": typeof lib_images;
  "lib/r2": typeof lib_r2;
  "lib/revalidate": typeof lib_revalidate;
  "lib/validation": typeof lib_validation;
  media: typeof media;
  projects: typeof projects;
  siteSettings: typeof siteSettings;
  skills: typeof skills;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
