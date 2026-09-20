import {describe, expect, it} from "vitest";

import {
  reviewLoginRedirect,
  type ReviewSessionState,
} from "../../apps/web/src/review/review-login-redirect.js";
import type {AccessContext} from "../../apps/web/src/api/client.js";

const privateTeamAccess = {
  accessMode: "private_team",
  login: {kind: "oidc"},
} satisfies AccessContext;

const localOwnerAccess = {
  accessMode: "local_owner",
  login: {kind: "local_owner"},
} satisfies AccessContext;

describe("review login redirect", () => {
  it("starts hosted login and preserves the complete review destination", () => {
    expect(reviewLoginRedirect(
      privateTeamAccess,
      "unauthenticated",
      {
        pathname: "/review",
        search: "?artifact=art_123&project=prj_default&view=focus",
      },
    )).toBe(
      "/auth/login?returnTo=%2Freview%3Fartifact%3Dart_123%26project%3Dprj_default%26view%3Dfocus",
    );
  });

  it.each<readonly [AccessContext | null, ReviewSessionState]>([
    [privateTeamAccess, "loading"],
    [privateTeamAccess, "ready"],
    [localOwnerAccess, "unauthenticated"],
    [null, "unauthenticated"],
  ])("does not redirect access context %# in session state %s", (context, state) => {
    expect(reviewLoginRedirect(context, state, {
      pathname: "/review",
      search: "",
    })).toBeNull();
  });
});
