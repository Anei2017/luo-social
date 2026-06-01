export function formatConvexError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes("Not authenticated")) {
      return "Session expired or not signed in. Refresh the page and try again.";
    }
    if (msg.includes("Complete your profile")) {
      return "Set up your profile first — go to onboarding.";
    }
    if (msg.includes("Could not find") && msg.includes("function")) {
      return "Backend out of date. Run: npx convex dev (in a second terminal).";
    }
    if (msg.includes("Server Error") || msg.includes("ArgumentValidationError")) {
      return "Database sync needed. Run: npx convex dev";
    }
    return msg;
  }
  return "Something went wrong. Try again.";
}
