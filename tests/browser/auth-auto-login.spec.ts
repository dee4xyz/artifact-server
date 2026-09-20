import {expect, test} from "@playwright/test";
import {Effect} from "effect";

import type {InteractiveIdentityProvider} from
  "../../src/application/interactive-login.js";
import {
  browserLoginKinds,
  privateTeamBrowserAccess,
} from "../../src/core/browser-access.js";
import {
  createTestInstallation,
  removeTestInstallation,
  startTestServer,
} from "../support/runtime-harness.js";

const identityProvider: InteractiveIdentityProvider = {
  complete: () => Effect.die("The automatic-login test never completes login."),
  name: "browser-automatic-login",
  start: () => Effect.succeed({
    authorizationUrl: "https://identity.example.test/authorize",
    codeVerifier: "browser-automatic-login-code-verifier",
    nonce: "browser-automatic-login-nonce",
    state: "browser-automatic-login-state",
  }),
};

test("private-team Review starts hosted login without an intermediate gate", async ({
  browser,
}) => {
  const installation = await createTestInstallation();
  const server = await startTestServer(installation, {
    browserAccess: privateTeamBrowserAccess(browserLoginKinds.oidc),
    interactiveIdentityProvider: identityProvider,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const reviewUrl = `${server.baseUrl}/review?${new URLSearchParams({
      artifact: "art_private",
      project: "prj_default",
      version: "ver_private",
      view: "focus",
    })}`;
    const authorizationRequest = page.waitForRequest(
      "https://identity.example.test/authorize",
    );
    await page.goto(reviewUrl);

    const request = await authorizationRequest;
    expect(request.isNavigationRequest()).toBe(true);
    expect(request.method()).toBe("GET");
  } finally {
    await context.close();
    await server.stop();
    await removeTestInstallation(installation);
  }
});
