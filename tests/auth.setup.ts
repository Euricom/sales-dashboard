import { test as setup, expect } from "@playwright/test";
import { sign } from "crypto";
const authFile = "playwright/.auth/user.json";

setup("authenticateTeamLeader", async ({ page }) => {
  // Navigate to the page
  await page.goto("/");

  // Sign in to the app
  const signInButton = page.getByRole("button");
  await signInButton.click();

  const signInButtonTeamLeader = page.getByRole("button");
  await signInButtonTeamLeader.click();

  await page.waitForTimeout(500);

  const teamleaderMail = process.env.TEAMLEADER_EMAIL!;
  const teamleaderPassword = process.env.TEAMLEADER_PASSWORD!;
  expect(teamleaderMail).not.toBeNull();
  expect(teamleaderPassword).not.toBeNull();


  const acceptCookies = page.locator(
    "a[id=CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll]",
  );
  await acceptCookies.click();
  // Enter credentials

  const emailInputTL = page.locator("input[type=email]");
  await emailInputTL.waitFor();
  await emailInputTL.click();
  await emailInputTL.fill(teamleaderMail);

  const passwordInputTL = page.locator("input[type=password]");
  await passwordInputTL.waitFor();
  await passwordInputTL.click();
  await passwordInputTL.fill(teamleaderPassword);

  await page.locator("button[type=submit]").click();
  await page.context().storageState({ path: authFile });
  
  await page.goto("/");
  await signInButton.click();
  await signInButtonTeamLeader.click(); 
  await page.waitForTimeout(500);
  await page.context().storageState({ path: authFile });
});
