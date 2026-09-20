import type {AccessContext} from "../api/client.js";

export type ReviewSessionState = "loading" | "ready" | "unauthenticated";

interface ReviewLocation {
  readonly pathname: string;
  readonly search: string;
}

/** Resolve the hosted browser login handoff without affecting local-owner mode. */
export function reviewLoginRedirect(
  accessContext: AccessContext | null,
  sessionState: ReviewSessionState,
  location: ReviewLocation,
): string | null {
  if (
    sessionState !== "unauthenticated"
    || accessContext?.accessMode !== "private_team"
  ) {
    return null;
  }

  const returnTo = `${location.pathname}${location.search}`;
  return `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
}
