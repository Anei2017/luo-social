/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminAuth from "../adminAuth.js";
import type * as comments from "../comments.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as follows from "../follows.js";
import type * as friends from "../friends.js";
import type * as groups from "../groups.js";
import type * as helpers from "../helpers.js";
import type * as jobs from "../jobs.js";
import type * as likes from "../likes.js";
import type * as marketplace from "../marketplace.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as polls from "../polls.js";
import type * as posts from "../posts.js";
import type * as reactions from "../reactions.js";
import type * as reels from "../reels.js";
import type * as safety from "../safety.js";
import type * as stories from "../stories.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminAuth: typeof adminAuth;
  comments: typeof comments;
  events: typeof events;
  files: typeof files;
  follows: typeof follows;
  friends: typeof friends;
  groups: typeof groups;
  helpers: typeof helpers;
  jobs: typeof jobs;
  likes: typeof likes;
  marketplace: typeof marketplace;
  messages: typeof messages;
  notifications: typeof notifications;
  polls: typeof polls;
  posts: typeof posts;
  reactions: typeof reactions;
  reels: typeof reels;
  safety: typeof safety;
  stories: typeof stories;
  users: typeof users;
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
