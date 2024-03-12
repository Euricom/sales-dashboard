import { test as setup, expect } from "@playwright/test";
const authFile = "playwright/.auth/user.json";

setup("authenticateAzure", async ({ page }) => {
  const azureMail = process.env.TEST_AZURE_MAIL!;
  const azurePassword = process.env.TEST_AZURE_PASSWORD!;
  expect(azureMail).not.toBeNull();
  expect(azurePassword).not.toBeNull();

  // Navigate to the page
  await page.goto("/");

  // Sign in to the app
  const signInButton = page.getByRole("button");
  await signInButton.click();

  const signInButtonAzure = page.getByRole("button");
  await signInButtonAzure.click();

  await page.waitForTimeout(500);

  // Enter credentials
  const emailInputAZURE = page.locator("input[type=email]");
  await emailInputAZURE.waitFor();
  await emailInputAZURE.click();
  await emailInputAZURE.fill(azureMail);

  await page.getByRole("button", { name: "Next" }).click();

  const passwordInputAZURE = page.locator("input[type=password]");
  await passwordInputAZURE.waitFor();
  await passwordInputAZURE.click();
  await passwordInputAZURE.fill(azurePassword);

  await page.locator("input[type=submit][value='Sign in']").click();
  await page.locator("input[type=submit][value='Yes']").click();

  await page.context().storageState({ path: authFile });

  await page.goto("/");
  await page.waitForTimeout(500);

  // TEAMLEADER LOGIN
  // workaround for sign in to azure, for some reason you need to login twice
  await signInButton.click();
  await signInButtonAzure.click();

  const teamleaderMail = process.env.TEAMLEADER_EMAIL!;
  const teamleaderPassword = process.env.TEAMLEADER_PASSWORD!;
  expect(teamleaderMail).not.toBeNull();
  expect(teamleaderPassword).not.toBeNull();

  // Navigate to the page
  await page.goto("/");

  await page.waitForSelector('[data-testid="employee-loading"]');

  const signInButtonTeamleader = page.getByRole("button", {
    name: "Login Teamleader",
  });

  // HERE IS WHERE TEST FAILS, IT FINDS THE BUTTON AND CLICKS IT, BUT IT DOESN'T NAVIGATE TO TEAMLEADER WHY?????
  await signInButtonTeamleader.click();

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

  // the storage state is being set before we acquire the needed cookie. If we do it later than this point, the cookies won't even be set in the first place and the test skips to the teamleader login once again.
  await page.context().storageState({ path: authFile });
  //console.log("storagestate set", new Date(new Date().getTime()).toString());

  await page.goto("/");
  await page.waitForSelector('[data-testid="employee-loading"]');
  await signInButtonTeamleader.click();
  await page.waitForTimeout(1000);
});
